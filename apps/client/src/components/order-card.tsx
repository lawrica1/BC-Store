"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";
import type { OrderDetail } from "@/lib/api";
import { formatXaf } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "destructive" | "outline"> = {
  PAID: "success",
  FAILED: "destructive",
  CANCELLED: "destructive"
};

export function OrderCard({ order }: { order: OrderDetail }) {
  const { dictionary, locale } = useLanguage();
  const copy = dictionary.orderLookup;

  return (
    <article className="glass-card grid gap-4 rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong className="break-all text-lg text-buyCyan">{order.orderNumber}</strong>
        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>{order.status}</Badge>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-textMuted">{copy.placed}</dt>
          <dd className="font-bold text-textMain">{new Date(order.createdAt).toLocaleDateString(locale === "fr" ? "fr-CM" : "en-CM")}</dd>
        </div>
        <div>
          <dt className="text-textMuted">{copy.delivery}</dt>
          <dd className="font-bold text-textMain">{order.deliveryMethod === "PICKUP" ? dictionary.checkout.pickup : order.deliveryAddress}</dd>
        </div>
      </dl>
      <div>
        <h2 className="mb-2 text-sm font-black uppercase tracking-normal text-textMuted">{copy.items}</h2>
        <ul className="grid gap-2">
          {order.items.map((item, index) => (
            <li key={`${item.productName}-${index}`} className="flex justify-between gap-3 border-b border-borderTech pb-2 text-sm last:border-none">
              <span className="text-textMain">
                {item.productName} × {item.quantity}
              </span>
              <strong className="text-buyCyan">{formatXaf(item.price * item.quantity, locale)}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between border-t border-borderTech pt-3">
        <span className="text-textMuted">{copy.total}</span>
        <strong className="text-xl text-buyCyan">{formatXaf(order.total, locale)}</strong>
      </div>
    </article>
  );
}
