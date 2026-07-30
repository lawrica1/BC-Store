"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/breadcrumb";
import { NeonButton } from "@/components/neon-button";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";
import { findProductBySlug } from "@/lib/products";
import { formatXaf } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export default function ProductDetailPage() {
  const params = useParams();
  const product = findProductBySlug(params.slug ?? "");
  const { dictionary, locale } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
          <div className="glass-card rounded-[2rem] p-8 text-textMain">{dictionary.shop.empty}</div>
        </main>
      </>
    );
  }

  const selectedProduct = product;
  const inStock = selectedProduct.stock > 0;
  const onSale = selectedProduct.originalPrice != null && selectedProduct.originalPrice > selectedProduct.price;
  const salePercent = onSale
    ? Math.round(((selectedProduct.originalPrice! - selectedProduct.price) / selectedProduct.originalPrice!) * 100)
    : 0;

  function addToCart() {
    for (let index = 0; index < quantity; index += 1) {
      addItem({ id: selectedProduct.id, name: selectedProduct.name[locale], price: selectedProduct.price, image: selectedProduct.image });
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
        <Breadcrumb
          items={[
            { label: dictionary.nav.home, href: "/" },
            { label: dictionary.nav.shop, href: "/boutique" },
            { label: dictionary.categories[selectedProduct.category], href: `/boutique?category=${selectedProduct.category}` },
            { label: selectedProduct.name[locale] }
          ]}
        />
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="glass-card relative grid min-h-[420px] place-items-center rounded-[2rem] p-6 shadow-cyanGlow">
              {onSale ? (
                <span className="absolute left-6 top-6 rounded-full bg-serviceOrange px-3 py-1 text-xs font-black text-white">
                  {dictionary.shop.saleBadge.replace("{percent}", String(salePercent))}
                </span>
              ) : null}
              <div className="grid h-56 w-56 place-items-center rounded-[2rem] border border-buyCyan/50 bg-buyCyan/10 text-6xl font-black text-buyCyan">
                {dictionary.categories[selectedProduct.category].slice(0, 2)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="glass-card aspect-square rounded-2xl border-buyCyan/20" />
              ))}
            </div>
          </div>

          <article className="glass-card grid h-max gap-6 rounded-[2rem] p-6">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{selectedProduct.brand}</p>
              <h1 className="mt-2 text-4xl font-black text-textMain">{selectedProduct.name[locale]}</h1>
              <p className="mt-3 text-textMuted">{selectedProduct.description[locale]}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <strong className="text-4xl font-black text-buyCyan">{formatXaf(selectedProduct.price, locale)}</strong>
              {onSale ? (
                <span className="text-lg text-textMuted line-through">{formatXaf(selectedProduct.originalPrice!, locale)}</span>
              ) : null}
              <span className="flex items-center gap-1 rounded-full border border-buyCyan/30 bg-buyCyan/10 px-4 py-2 text-sm font-black text-buyCyan">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
                </svg>
                {selectedProduct.rating.toFixed(1)} / 5
              </span>
              <span className={`rounded-full px-4 py-2 text-sm font-black ${inStock ? "bg-successEmerald/10 text-successEmerald" : "bg-red-500/10 text-red-400"}`}>
                {inStock ? dictionary.shop.stock : dictionary.shop.out}
              </span>
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-textMain">{dictionary.shop.quantity}</p>
              <div className="inline-grid grid-cols-3 rounded-full border border-borderTech bg-slatePanel p-1">
                <button type="button" className="h-10 w-10 rounded-full text-textMain" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
                <span className="grid h-10 w-12 place-items-center text-textMain">{quantity}</span>
                <button type="button" className="h-10 w-10 rounded-full text-textMain" onClick={() => setQuantity((value) => value + 1)}>+</button>
              </div>
            </div>
            <NeonButton intent="buy" disabled={!inStock} onClick={addToCart} className="w-full disabled:cursor-not-allowed disabled:opacity-40">
              {dictionary.shop.add}
            </NeonButton>
            <div className="grid gap-3">
              <Details title={dictionary.shop.description}>{selectedProduct.description[locale]}</Details>
              <Details title={dictionary.shop.specifications}>
                <ul className="grid gap-2">
                  {selectedProduct.specs[locale].map((spec) => <li key={spec}>{spec}</li>)}
                </ul>
              </Details>
              <Details title={dictionary.shop.reviews}>{selectedProduct.rating.toFixed(1)}/5</Details>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

function Details({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-2xl border border-borderTech bg-void p-4" open>
      <summary className="cursor-pointer font-black text-textMain">{title}</summary>
      <div className="mt-3 text-sm text-textMuted">{children}</div>
    </details>
  );
}
