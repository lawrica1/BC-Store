"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import { createServiceRequest, uploadPhoto } from "@/lib/api";

export default function OtherPage() {
  const { dictionary } = useLanguage();
  const [toast, setToast] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await uploadPhoto(file);
      setPhotoUrl(url);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[calc(100vh-80px)] place-items-center px-4 py-8 sm:px-5 sm:py-12">
        <div className="w-full max-w-2xl">
        <form
          className="glass-card grid w-full max-w-2xl gap-4 rounded-3xl p-4 sm:p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              await createServiceRequest({
                serviceType: "AUTRE",
                customerName: String(form.get("customerName") ?? ""),
                customerPhone: String(form.get("customerPhone") ?? ""),
                description: String(form.get("description") ?? ""),
                photoUrl: photoUrl ?? undefined
              });
              setToast(dictionary.other.sent);
              event.currentTarget.reset();
              setPhotoUrl(null);
              setPhotoPreview(null);
            } catch (error) {
              setToast(error instanceof Error ? error.message : "Request failed");
            }
          }}
        >
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.nav.other}</p>
            <h1 className="mt-2 text-2xl font-black text-textMain sm:text-3xl">{dictionary.other.title}</h1>
          </div>
          <Input name="customerName" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.name} required />
          <Input name="customerPhone" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.phone} required />
          <Textarea name="description" className="min-h-40 rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.message} required />
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`grid min-h-32 cursor-pointer place-items-center gap-3 rounded-3xl border border-dashed p-4 text-center text-sm text-textMuted transition ${
              dragOver ? "border-buyCyan bg-buyCyan/5" : "border-white/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-24 w-24 rounded-2xl object-cover" />
            ) : null}
            <span>{uploading ? "Envoi en cours..." : dictionary.other.upload}</span>
          </div>
          <NeonButton intent="ghost" type="submit" className="w-full border-buyCyan text-buyCyan" disabled={uploading}>
            {dictionary.other.submit}
          </NeonButton>
        </form>
        </div>
        {toast ? (
          <div className="fixed bottom-5 right-5 rounded-2xl border border-buyCyan bg-slatePanel p-4 text-sm font-bold text-textMain shadow-cyanGlow">
            {toast}
          </div>
        ) : null}
      </main>
    </>
  );
}
