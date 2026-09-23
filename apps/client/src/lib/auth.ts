import type { UserRole } from "@bc-store/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "bc-store-token";

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; name: string; role: UserRole };
}

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as TokenPayload;
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function authenticate(path: string, body: Record<string, string | undefined>, failure: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;
    throw new Error(message ?? failure);
  }

  const data = (await response.json()) as LoginResponse;
  setToken(data.accessToken);
  return data;
}

export function login(email: string, password: string) {
  return authenticate("/auth/login", { email, password }, "Login failed");
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export function register(input: RegisterInput) {
  return authenticate("/auth/register", { ...input }, "Registration failed");
}

export function logout() {
  clearToken();
}
