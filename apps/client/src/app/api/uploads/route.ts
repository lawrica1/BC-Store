import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_CONFIGURED = Boolean(AWS_REGION && AWS_S3_BUCKET && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY);

function extensionFor(mimeType: string) {
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[mimeType] ?? "bin";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ message: "Only JPEG, PNG, WEBP or AVIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ message: "File too large (max 5MB)." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${extensionFor(file.type)}`;

  if (S3_CONFIGURED) {
    const client = new S3Client({
      region: AWS_REGION,
      credentials: { accessKeyId: AWS_ACCESS_KEY_ID!, secretAccessKey: AWS_SECRET_ACCESS_KEY! }
    });
    await client.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: `uploads/${filename}`,
        Body: bytes,
        ContentType: file.type
      })
    );
    return NextResponse.json({ url: `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/uploads/${filename}` });
  }

  // No AWS credentials configured (the default in local dev) — fall back to disk under public/uploads,
  // mirroring how Stripe/Orange Money/MTN MoMo already stub out when their own credentials are unset.
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
