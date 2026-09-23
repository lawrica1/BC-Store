"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

const CATEGORIES = ["CASQUE", "ECOUTEUR", "CHARGEUR", "POWERBANK", "TELEPHONE", "ORDINATEUR"] as const;

export function CategoryStrip() {
  const { dictionary } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:px-10">
      <p className="mb-4 text-sm font-black uppercase tracking-normal text-textMuted">{dictionary.shop.category}</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/boutique?category=${category}`}
            className="glass-card lift-glow grid min-w-[110px] flex-1 gap-2 rounded-2xl p-3 text-center hover:border-buyCyan/60 hover:shadow-cyanGlow"
          >
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-buyCyan/10 text-sm font-black text-buyCyan">
              {dictionary.categories[category].slice(0, 2)}
            </div>
            <strong className="text-xs text-textMain">{dictionary.categories[category]}</strong>
            <span className="justify-self-center rounded-full bg-serviceOrange/10 px-2 py-0.5 text-[10px] font-bold text-serviceOrange">
              {dictionary.categoryTags[category]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
