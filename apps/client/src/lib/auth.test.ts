import { describe, expect, it } from "vitest";
import { decodeToken } from "@/lib/auth";

function tokenFor(payload: object) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

const inAnHour = Math.floor(Date.now() / 1000) + 3600;

describe("decodeToken", () => {
  it("reads the id, email and role from a valid token", () => {
    const payload = decodeToken(tokenFor({ sub: "user-1", email: "a@b.c", role: "TECHNICIAN", exp: inAnHour }));
    expect(payload).toMatchObject({ sub: "user-1", email: "a@b.c", role: "TECHNICIAN" });
  });

  it("returns null for an expired token", () => {
    const expired = Math.floor(Date.now() / 1000) - 10;
    expect(decodeToken(tokenFor({ sub: "u", email: "a@b.c", role: "ADMIN", exp: expired }))).toBeNull();
  });

  it("returns null for garbage", () => {
    expect(decodeToken("not-a-token")).toBeNull();
    expect(decodeToken("")).toBeNull();
  });
});
