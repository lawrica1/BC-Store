"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { GeofenceCheck } from "@/components/geofence-check";
import { NeonButton } from "@/components/neon-button";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { PAYMENT_RECEIVER_PHONE, checkout } from "@/lib/api";
import { formatXaf } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export default function CheckoutPage() {
  const { dictionary, locale } = useLanguage();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [method, setMethod] = useState<"mobile" | "orange" | "card">("mobile");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);
  const appliedDeliveryFee = deliveryMethod === "DELIVERY" ? deliveryFee : 0;
  const total = itemsTotal + appliedDeliveryFee;

  async function confirmOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    try {
      await checkout({
        customerName: String(form.get("customerName") ?? ""),
        customerPhone: String(form.get("customerPhone") ?? ""),
        deliveryAddress: deliveryMethod === "DELIVERY" ? String(form.get("deliveryAddress") ?? "") : "BC Store",
        deliveryMethod,
        deliveryFee: appliedDeliveryFee,
        paymentMethod: method === "card" ? "CARD" : method === "orange" ? "ORANGE_MONEY" : "MOBILE_MONEY",
        paymentReceiverPhone: PAYMENT_RECEIVER_PHONE,
        items: items.map((item) => ({ productId: item.id, quantity: 1, price: item.price }))
      });
      setToast(dictionary.checkout.success.replace("{phone}", PAYMENT_RECEIVER_PHONE));
      clear();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
        <Breadcrumb
          items={[
            { label: dictionary.nav.home, href: "/" },
            { label: dictionary.nav.shop, href: "/boutique" },
            { label: dictionary.shop.checkout }
          ]}
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form className="glass-card grid gap-8 rounded-[2rem] p-6" onSubmit={confirmOrder}>
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.checkout.confirmation}</p>
            <h1 className="mt-2 text-4xl font-black text-textMain">{dictionary.checkout.title}</h1>
          </div>

          <section className="grid gap-4">
            <h2 className="text-2xl font-black text-textMain">1. {dictionary.checkout.delivery}</h2>
            <input name="customerName" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.name} required />
            <input name="customerPhone" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.phone} required />

            <div className="grid grid-cols-2 gap-2 rounded-full border border-borderTech bg-slatePanel p-1">
              <button
                type="button"
                onClick={() => setDeliveryMethod("PICKUP")}
                className={`min-h-12 rounded-full px-4 text-sm font-black transition ${deliveryMethod === "PICKUP" ? "bg-gradient-to-r from-buyCyan to-buyBlue text-void" : "text-textMuted"}`}
              >
                {dictionary.checkout.pickup}
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("DELIVERY")}
                className={`min-h-12 rounded-full px-4 text-sm font-black transition ${deliveryMethod === "DELIVERY" ? "bg-serviceOrange text-white" : "text-textMuted"}`}
              >
                {dictionary.checkout.deliverToAddress}
              </button>
            </div>

            {deliveryMethod === "PICKUP" ? (
              <p className="rounded-2xl border border-buyCyan/30 bg-buyCyan/5 p-4 text-sm font-bold text-buyCyan">{dictionary.checkout.pickupHint}</p>
            ) : (
              <>
                <textarea name="deliveryAddress" className="cyan-focus min-h-28 rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.checkout.address} required />
                <GeofenceCheck onChange={(_zone, fee) => setDeliveryFee(fee)} />
              </>
            )}
          </section>

          <section className="grid gap-4">
            <h2 className="text-2xl font-black text-textMain">2. {dictionary.checkout.payment}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left font-black transition hover:-translate-y-0.5 ${method === "mobile" ? "border-buyCyan bg-buyCyan/10 text-buyCyan" : "border-borderTech text-textMuted"}`}
                onClick={() => setMethod("mobile")}
              >
                {dictionary.checkout.mobileMoney}
              </button>
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left font-black transition hover:-translate-y-0.5 ${method === "orange" ? "border-serviceOrange bg-serviceOrange/10 text-serviceOrange" : "border-borderTech text-textMuted"}`}
                onClick={() => setMethod("orange")}
              >
                {dictionary.checkout.orangeMoney}
              </button>
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left font-black transition hover:-translate-y-0.5 ${method === "card" ? "border-buyCyan bg-buyCyan/10 text-buyCyan" : "border-borderTech text-textMuted"}`}
                onClick={() => setMethod("card")}
              >
                {dictionary.checkout.card}
              </button>
            </div>
            <div className="rounded-2xl border border-serviceOrange/40 bg-serviceOrange/10 p-4 text-sm font-bold text-textMain">
              <span className="block text-serviceOrange">{dictionary.checkout.receiverLabel}</span>
              <span className="mt-1 block text-2xl font-black text-serviceOrange">{PAYMENT_RECEIVER_PHONE}</span>
              <span className="mt-1 block text-textMuted">{dictionary.checkout.receiverHint}</span>
            </div>
            <div className="flex gap-3">
              <input className="cyan-focus rounded-full border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.checkout.promo} />
              <button type="button" className="rounded-full border border-buyCyan px-5 py-3 font-black text-buyCyan">{dictionary.checkout.apply}</button>
            </div>
          </section>

          <NeonButton type="submit" intent="buy" disabled={!items.length || submitting} className="w-full disabled:cursor-not-allowed disabled:opacity-50">{dictionary.checkout.confirm}</NeonButton>
        </form>

        <aside className="glass-card sticky top-24 h-max rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-textMain">{dictionary.checkout.summary}</h2>
          <div className="mt-5 grid gap-3">
            {items.length ? items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between gap-4 border-b border-borderTech pb-3 text-sm">
                <span className="text-textMain">{item.name}</span>
                <strong className="text-buyCyan">{formatXaf(item.price, locale)}</strong>
              </div>
            )) : <p className="text-sm text-textMuted">{dictionary.shop.empty}</p>}
          </div>
          {appliedDeliveryFee > 0 ? (
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-textMuted">{dictionary.checkout.deliveryFee}</span>
              <strong className="text-serviceOrange">{formatXaf(appliedDeliveryFee, locale)}</strong>
            </div>
          ) : null}
          <div className="mt-5 flex justify-between border-t border-borderTech pt-5">
            <span className="text-textMuted">{dictionary.shop.total}</span>
            <strong className="text-2xl text-buyCyan">{formatXaf(total, locale)}</strong>
          </div>
        </aside>
        </div>
      </main>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-buyCyan bg-slatePanel/95 p-4 text-sm font-bold text-textMain shadow-cyanGlow">
          {toast}
        </div>
      ) : null}
    </>
  );
}
