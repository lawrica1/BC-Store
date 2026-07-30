"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { RepairForm } from "@/components/repair-form";
import { SiteHeader } from "@/components/site-header";
import { useLanguage } from "@/components/language-provider";

export default function RepairPage() {
  const { dictionary } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
        <Breadcrumb items={[{ label: dictionary.nav.home, href: "/" }, { label: dictionary.nav.repair }]} />
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[2rem] border border-serviceOrange/40 bg-serviceOrange/10 p-8 shadow-orangeGlow">
            <p className="text-sm font-black uppercase tracking-normal text-serviceOrange">BC Tech</p>
            <h1 className="mt-4 text-4xl font-black text-textMain md:text-6xl">{dictionary.repair.title}</h1>
            <p className="mt-5 text-lg text-textMuted">{dictionary.repair.copy}</p>
          </section>
          <RepairForm />
        </div>
      </main>
    </>
  );
}
