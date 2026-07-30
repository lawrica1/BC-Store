"use client";

import { Link } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";

const CATEGORIES = ["CASQUE", "ECOUTEUR", "CHARGEUR", "POWERBANK", "TELEPHONE", "ORDINATEUR"] as const;

export function CategoryStrip() {
  const { dictionary } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
      <p className="mb-5 text-sm font-black uppercase tracking-normal text-textMuted">{dictionary.shop.category}</p>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            to={`/boutique?category=${category}`}
            className="glass-card lift-glow grid min-w-[140px] flex-1 gap-3 rounded-3xl p-5 text-center hover:border-buyCyan/60 hover:shadow-cyanGlow"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-buyCyan/10 text-lg font-black text-buyCyan">
              {dictionary.categories[category].slice(0, 2)}
            </div>
            <strong className="text-sm text-textMain">{dictionary.categories[category]}</strong>
            <span className="justify-self-center rounded-full bg-serviceOrange/10 px-3 py-1 text-[11px] font-bold text-serviceOrange">
              {dictionary.categoryTags[category]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
