"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { NeonButton } from "@/components/neon-button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";

export function AccountForm() {
  const { dictionary } = useLanguage();
  const { login, register } = useRole();
  const copy = dictionary.account;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError("");
    try {
      if (isRegister) {
        await register({
          email,
          password,
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? "") || undefined
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card grid gap-4 rounded-3xl p-5 sm:p-6" aria-label={isRegister ? copy.registerTitle : copy.loginTitle}>
      <div>
        <h2 className="text-xl font-black text-textMain">{isRegister ? copy.registerTitle : copy.loginTitle}</h2>
        <p className="mt-1 text-sm text-textMuted">{copy.intro}</p>
      </div>

      {isRegister ? (
        <Input name="name" required autoComplete="name" placeholder={copy.name} className="rounded-2xl border-borderTech bg-void text-textMain" />
      ) : null}
      <Input name="email" type="email" required autoComplete="email" placeholder={copy.email} className="rounded-2xl border-borderTech bg-void text-textMain" />
      <Input
        name="password"
        type="password"
        required
        minLength={isRegister ? 8 : undefined}
        autoComplete={isRegister ? "new-password" : "current-password"}
        placeholder={isRegister ? `${copy.password} — ${copy.passwordHint}` : copy.password}
        className="rounded-2xl border-borderTech bg-void text-textMain"
      />
      {isRegister ? (
        <Input name="phone" type="tel" autoComplete="tel" placeholder={copy.phone} className="rounded-2xl border-borderTech bg-void text-textMain" />
      ) : null}

      {error ? <p role="alert" className="text-sm font-bold text-red-400">{error}</p> : null}

      <NeonButton type="submit" intent="buy" disabled={pending} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? copy.pending : isRegister ? copy.register : copy.login}
      </NeonButton>

      <p className="text-center text-sm text-textMuted">
        {isRegister ? copy.haveAccount : copy.noAccount}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isRegister ? "login" : "register");
            setError("");
          }}
          className="font-bold text-buyCyan hover:underline"
        >
          {isRegister ? copy.login : copy.register}
        </button>
      </p>
    </form>
  );
}
