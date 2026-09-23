"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { NeonButton } from "@/components/neon-button";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { useRole } from "@/components/role-provider";

export function AdminLogin() {
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
      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-md place-items-center px-4 sm:px-5">
        <form className="glass-card w-full rounded-3xl p-5 sm:p-6" onSubmit={handleSubmit}>
          <h1 className="text-xl font-black text-textMain sm:text-2xl">Connexion Admin</h1>
          <p className="mt-2 text-sm text-textMuted">Réservé aux administrateurs et techniciens BC Store.</p>
          <div className="mt-6 grid gap-4">
            <Input name="email" type="email" required placeholder="Email" className="rounded-2xl border-borderTech bg-void text-textMain" />
            <Input name="password" type="password" required placeholder="Mot de passe" className="rounded-2xl border-borderTech bg-void text-textMain" />
            {error ? <p className="text-sm font-bold text-red-400">{error}</p> : null}
            <NeonButton type="submit" intent="buy" disabled={submitting} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? "Connexion..." : "Se connecter"}
            </NeonButton>
          </div>
        </form>
      </main>
    </>
  );
}
