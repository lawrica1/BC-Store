"use client";

import { useState } from "react";
import type { ProductViewModel } from "@/lib/products";
import { useLanguage } from "@/components/language-provider";
import { useCartStore } from "@/store/cart-store";
import { formatXaf } from "@/lib/utils";
import { NeonButton } from "@/components/neon-button";
import { Link } from "react-router-dom";

export function ProductCard({ product }: { product: ProductViewModel }) {
  const { dictionary, locale } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock > 0;
  const [wishlisted, setWishlisted] = useState(false);
  const onSale = product.originalPrice != null && product.originalPrice > product.price;
  const salePercent = onSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  return (
    <article className="glass-card lift-glow group grid gap-4 rounded-3xl p-4 hover:border-buyCyan/60 hover:shadow-cyanGlow">
      <div className="relative grid aspect-[4/3] place-items-center rounded-2xl border border-borderTech bg-slatePanel/80">
        {onSale ? (
          <span className="absolute left-3 top-3 rounded-full bg-serviceOrange px-3 py-1 text-xs font-black text-white">
            {dictionary.shop.saleBadge.replace("{percent}", String(salePercent))}
          </span>
        ) : null}
        <button
          type="button"
          aria-label="Wishlist"
          aria-pressed={wishlisted}
          onClick={() => setWishlisted((value) => !value)}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border transition hover:-translate-y-0.5 ${
            wishlisted ? "border-serviceOrange bg-serviceOrange/10 text-serviceOrange" : "border-borderTech bg-void/60 text-textMuted"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-buyCyan/25 to-buyBlue/25 text-3xl font-black text-buyCyan">
          {product.category.slice(0, 2)}
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-3 text-xs">
          <span className="font-black uppercase tracking-normal text-textMuted">{product.brand}</span>
          <span className="flex items-center gap-1 font-bold text-textMain">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-serviceOrange">
              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
            </svg>
            {product.rating.toFixed(1)}
          </span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg font-black text-buyCyan">{formatXaf(product.price, locale)}</span>
          {onSale ? <span className="text-sm text-textMuted line-through">{formatXaf(product.originalPrice!, locale)}</span> : null}
        </div>
        <h3 className="text-base font-bold text-textMain">{product.name[locale]}</h3>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${inStock ? "bg-successEmerald/10 text-successEmerald" : "bg-red-500/10 text-red-400"}`}>
          {inStock ? dictionary.shop.stock : dictionary.shop.out}
        </span>
        <Link className="text-sm font-black text-buyCyan hover:underline" to={`/boutique/${product.slug}`}>
          {dictionary.shop.view}
        </Link>
      </div>
      <div>
        <NeonButton
          intent="buy"
          disabled={!inStock}
          className="w-full min-h-10 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => addItem({ id: product.id, name: product.name[locale], price: product.price, image: product.image })}
        >
          {dictionary.shop.add}
        </NeonButton>
      </div>
    </article>
  );
}
