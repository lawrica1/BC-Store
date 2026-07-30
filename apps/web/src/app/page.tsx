"use client";

import { useRef } from "react";
import { CategoryStrip } from "@/components/category-strip";
import { HeroCarousel } from "@/components/hero-carousel";
import { NeonButton } from "@/components/neon-button";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/products";
import { useLanguage } from "@/components/language-provider";

export default function HomePage() {
  const { dictionary } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollLatest(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <>
      <SiteHeader />
      <main>
        <HeroCarousel />

        <CategoryStrip />

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.shop.title}</p>
              <h2 className="text-3xl font-black text-textMain md:text-5xl">{dictionary.shop.copy}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollLatest(-1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-borderTech text-textMain transition hover:border-buyCyan/60 hover:text-buyCyan"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollLatest(1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-borderTech text-textMain transition hover:border-buyCyan/60 hover:text-buyCyan"
              >
                →
              </button>
              <NeonButton href="/boutique" intent="ghost">{dictionary.nav.shop}</NeonButton>
            </div>
          </div>
          <div ref={scrollerRef} className="flex gap-5 overflow-x-auto pb-2 scroll-smooth">
            {products.map((product) => (
              <div key={product.id} className="w-72 flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-borderTech bg-slatePanel px-5 py-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <strong className="text-textMain">BC Store</strong>
            <a href="tel:+237650000000" className="text-2xl font-black text-serviceOrange animate-pulse">+237 659 870 906</a>
          </div>
        </footer>
      </main>
    </>
  );
}
