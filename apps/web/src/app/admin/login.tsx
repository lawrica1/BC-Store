"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { useRole } from "@/components/role-provider";

export default function AdminLoginPage() {
  const { login } = useRole();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-md place-items-center px-5">
        <form className="glass-card w-full rounded-[2rem] p-8" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-black text-textMain">Connexion Admin</h1>
          <p className="mt-2 text-sm text-textMuted">Réservé aux administrateurs et techniciens BC Store.</p>
          <div className="mt-6 grid gap-4">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Mot de passe"
              className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain"
            />
            {error ? <p className="text-sm font-bold text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-gradient-to-r from-buyCyan to-buyBlue px-6 py-3 font-black text-void transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
