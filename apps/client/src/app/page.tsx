"use client";

import { CategoryStrip } from "@/components/category-strip";
import { HeroCarousel } from "@/components/hero-carousel";
import { NeonButton } from "@/components/neon-button";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/lib/products";
import { useLanguage } from "@/components/language-provider";

export default function HomePage() {
  const { dictionary } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main>
        <HeroCarousel />

        <CategoryStrip />

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-16 lg:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.shop.title}</p>
              <h2 className="text-xl font-black text-textMain sm:text-2xl md:text-3xl">{dictionary.shop.copy}</h2>
            </div>
            <NeonButton href="/boutique" intent="ghost" className="self-start sm:self-auto">{dictionary.nav.shop}</NeonButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <footer className="border-t border-borderTech bg-slatePanel px-4 py-8 sm:px-5 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <strong className="text-textMain">BC Store</strong>
            <a href="tel:+237650000000" className="text-xl font-black text-serviceOrange animate-pulse sm:text-2xl">+237 659 870 906</a>
          </div>
        </footer>
      </main>
    </>
  );
}
