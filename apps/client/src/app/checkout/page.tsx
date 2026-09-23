"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { GeofenceCheck } from "@/components/geofence-check";
import { NeonButton } from "@/components/neon-button";
import { PaymentPanel } from "@/components/payment-panel";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/components/language-provider";
import { PAYMENT_RECEIVER_PHONE, checkout } from "@/lib/api";
import { formatXaf } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface PendingPayment {
  orderNumber: string;
  paymentMethod: "CARD" | "MOBILE_MONEY" | "ORANGE_MONEY";
  stripeClientSecret?: string;
  paymentUrl?: string;
}

// The cart stores one entry per unit; the API wants one line per product with a quantity.
function groupByProduct(items: Array<{ id: string }>) {
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.id, (quantities.get(item.id) ?? 0) + 1);
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

export default function CheckoutPage() {
  const { dictionary, locale } = useLanguage();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [method, setMethod] = useState<"mobile" | "orange" | "card">("mobile");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);
  const appliedDeliveryFee = deliveryMethod === "DELIVERY" ? deliveryFee : 0;
  const total = itemsTotal + appliedDeliveryFee;

  async function confirmOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const paymentMethod = method === "card" ? "CARD" : method === "orange" ? "ORANGE_MONEY" : "MOBILE_MONEY";

    setSubmitting(true);
    try {
      const result = await checkout({
        customerName: String(form.get("customerName") ?? ""),
        customerPhone: String(form.get("customerPhone") ?? ""),
        deliveryAddress: deliveryMethod === "DELIVERY" ? String(form.get("deliveryAddress") ?? "") : "BC Store",
        deliveryMethod,
        deliveryFee: appliedDeliveryFee,
        paymentMethod,
        paymentReceiverPhone: PAYMENT_RECEIVER_PHONE,
        items: groupByProduct(items)
      });

      // The dev-only local stub (no backend configured) never reaches a real payment provider to
      // poll, so there's nothing to wait on — resolve it immediately instead of leaving the payment
      // panel polling a real API for an order number ("LOCAL-...") that was never actually created.
      if (result.orderNumber.startsWith("LOCAL-")) {
        handlePaymentSettled("PAID");
      } else {
        setPendingPayment({
          orderNumber: result.orderNumber,
          paymentMethod,
          stripeClientSecret: result.stripeClientSecret,
          paymentUrl: result.paymentUrl
        });
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentSettled(status: "PAID" | "FAILED") {
    if (status === "PAID") {
      setToast(dictionary.checkout.success.replace("{phone}", PAYMENT_RECEIVER_PHONE));
      clear();
    } else {
      setToast("Le paiement a échoué. Veuillez réessayer.");
    }
    setPendingPayment(null);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {pendingPayment ? (
          <div className="glass-card grid gap-6 rounded-3xl p-4 sm:p-6">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{pendingPayment.orderNumber}</p>
              <h1 className="mt-2 text-xl font-black text-textMain sm:text-2xl">{dictionary.checkout.payment}</h1>
            </div>
            <PaymentPanel
              orderNumber={pendingPayment.orderNumber}
              paymentMethod={pendingPayment.paymentMethod}
              stripeClientSecret={pendingPayment.stripeClientSecret}
              paymentUrl={pendingPayment.paymentUrl}
              onSettled={handlePaymentSettled}
            />
          </div>
        ) : (
        <form className="glass-card grid gap-6 rounded-3xl p-4 sm:p-6" onSubmit={confirmOrder}>
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.checkout.confirmation}</p>
            <h1 className="mt-2 text-2xl font-black text-textMain sm:text-3xl">{dictionary.checkout.title}</h1>
          </div>

          <section className="grid gap-4">
            <h2 className="text-lg font-black text-textMain sm:text-xl">1. {dictionary.checkout.delivery}</h2>
            <Input name="customerName" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.name} required />
            <Input name="customerPhone" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.phone} required />

            <ToggleGroup
              type="single"
              value={deliveryMethod}
              onValueChange={(value) => value && setDeliveryMethod(value as "PICKUP" | "DELIVERY")}
              className="grid grid-cols-2 gap-2 rounded-full border border-borderTech bg-slatePanel p-1"
            >
              <ToggleGroupItem
                value="PICKUP"
                className="min-h-12 rounded-full px-4 text-sm font-black text-textMuted transition data-[state=on]:bg-gradient-to-r data-[state=on]:from-buyCyan data-[state=on]:to-buyBlue data-[state=on]:text-void"
              >
                {dictionary.checkout.pickup}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="DELIVERY"
                className="min-h-12 rounded-full px-4 text-sm font-black text-textMuted transition data-[state=on]:bg-serviceOrange data-[state=on]:text-white"
              >
                {dictionary.checkout.deliverToAddress}
              </ToggleGroupItem>
            </ToggleGroup>

            {deliveryMethod === "PICKUP" ? (
              <p className="rounded-2xl border border-buyCyan/30 bg-buyCyan/5 p-4 text-sm font-bold text-buyCyan">{dictionary.checkout.pickupHint}</p>
            ) : (
              <>
                <Textarea name="deliveryAddress" className="min-h-28 rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.checkout.address} required />
                <GeofenceCheck onChange={(_zone, fee) => setDeliveryFee(fee)} />
              </>
            )}
          </section>

          <section className="grid gap-4">
            <h2 className="text-lg font-black text-textMain sm:text-xl">2. {dictionary.checkout.payment}</h2>
            <ToggleGroup
              type="single"
              value={method}
              onValueChange={(value) => value && setMethod(value as "mobile" | "orange" | "card")}
              className="grid gap-3 sm:grid-cols-3"
            >
              <ToggleGroupItem
                value="mobile"
                className="h-auto justify-start rounded-2xl border border-borderTech p-3 text-left text-sm font-black text-textMuted transition hover:-translate-y-0.5 data-[state=on]:border-buyCyan data-[state=on]:bg-buyCyan/10 data-[state=on]:text-buyCyan"
              >
                {dictionary.checkout.mobileMoney}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="orange"
                className="h-auto justify-start rounded-2xl border border-borderTech p-3 text-left text-sm font-black text-textMuted transition hover:-translate-y-0.5 data-[state=on]:border-serviceOrange data-[state=on]:bg-serviceOrange/10 data-[state=on]:text-serviceOrange"
              >
                {dictionary.checkout.orangeMoney}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="card"
                className="h-auto justify-start rounded-2xl border border-borderTech p-3 text-left text-sm font-black text-textMuted transition hover:-translate-y-0.5 data-[state=on]:border-buyCyan data-[state=on]:bg-buyCyan/10 data-[state=on]:text-buyCyan"
              >
                {dictionary.checkout.card}
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="rounded-2xl border border-serviceOrange/40 bg-serviceOrange/10 p-4 text-sm font-bold text-textMain">
              <span className="block text-serviceOrange">{dictionary.checkout.receiverLabel}</span>
              <span className="mt-1 block text-xl font-black text-serviceOrange">{PAYMENT_RECEIVER_PHONE}</span>
              <span className="mt-1 block text-textMuted">{dictionary.checkout.receiverHint}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input className="rounded-full border-borderTech bg-void text-textMain" placeholder={dictionary.checkout.promo} />
              <button type="button" className="rounded-full border border-buyCyan px-5 py-3 font-black text-buyCyan">{dictionary.checkout.apply}</button>
            </div>
          </section>

          <NeonButton type="submit" intent="buy" disabled={!items.length || submitting} className="w-full disabled:cursor-not-allowed disabled:opacity-50">{dictionary.checkout.confirm}</NeonButton>
        </form>
        )}

        <aside className="glass-card h-max rounded-3xl p-4 sm:sticky sm:top-24 sm:p-6">
          <h2 className="text-lg font-black text-textMain sm:text-xl">{dictionary.checkout.summary}</h2>
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
            <strong className="text-xl text-buyCyan">{formatXaf(total, locale)}</strong>
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
