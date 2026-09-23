"use client";

import { RepairForm } from "@/components/repair-form";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";

export default function RepairPage() {
  const { dictionary } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-serviceOrange/40 bg-serviceOrange/10 p-4 shadow-orangeGlow sm:p-6">
            <p className="text-sm font-black uppercase tracking-normal text-serviceOrange">BC Tech</p>
            <h1 className="mt-4 text-2xl font-black text-textMain sm:text-3xl md:text-5xl">{dictionary.repair.title}</h1>
            <p className="mt-5 text-lg text-textMuted">{dictionary.repair.copy}</p>
          </section>
          <RepairForm />
        </div>
      </main>
    </>
  );
}
