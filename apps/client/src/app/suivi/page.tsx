"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { NeonButton } from "@/components/neon-button";
import { OrderCard } from "@/components/order-card";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { fetchOrder } from "@/lib/api";
import type { OrderDetail } from "@/lib/api";

export default function OrderLookupPage() {
  const { dictionary } = useLanguage();
  const copy = dictionary.orderLookup;
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrder(null);
    try {
      setOrder(await fetchOrder(encodeURIComponent(trimmed)));
    } catch {
      setError(copy.notFound);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-12">
        <div className="grid gap-6">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.nav.track}</p>
            <h1 className="mt-2 text-2xl font-black text-textMain sm:text-3xl">{copy.title}</h1>
            <p className="mt-2 text-textMuted">{copy.copy}</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:p-5">
            <Input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder={copy.placeholder}
              required
              className="rounded-full border-borderTech bg-void text-textMain"
            />
            <NeonButton type="submit" intent="buy" disabled={loading} className="disabled:cursor-not-allowed disabled:opacity-50">
              {copy.search}
            </NeonButton>
          </form>

          {error ? <p className="text-center text-sm font-bold text-red-400">{error}</p> : null}
          {order ? <OrderCard order={order} /> : null}
        </div>
      </main>
    </>
  );
}
