"use client";

import { Suspense, lazy } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
import { useLanguage } from "@/components/language-provider";
import { STORE_COORDINATES } from "@/lib/geofence";

const StoreMap = lazy(() => import("@/components/store-map").then((m) => ({ default: m.StoreMap })));

export default function SupportPage() {
  const { dictionary } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
        <Breadcrumb items={[{ label: dictionary.nav.home, href: "/" }, { label: dictionary.nav.support }]} />
        <div className="grid gap-6 lg:grid-cols-[60fr_40fr]">
        <section className="glass-card grid min-h-[480px] gap-4 rounded-[2rem] p-6 shadow-cyanGlow">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-normal text-textMuted">{dictionary.support.title}</p>
            <h1 className="mt-1 text-2xl font-black text-buyCyan">{dictionary.support.map}</h1>
          </div>
          <Suspense fallback={<div className="h-full min-h-80 w-full animate-pulse rounded-2xl border border-buyCyan/20 bg-slatePanel/60" />}>
            <StoreMap storeCoords={STORE_COORDINATES} storeLabel={dictionary.geofence.mapStoreLabel} />
          </Suspense>
        </section>
        <section className="glass-card rounded-[2rem] p-6">
          <p className="text-sm font-black uppercase tracking-normal text-serviceOrange">{dictionary.support.call}</p>
          <a href="tel:+237650000000" className="mt-4 block text-5xl font-black text-serviceOrange animate-pulse">+237 659870906</a>
          <form className="mt-8 grid gap-4">
            <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.name} />
            <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.phone} />
            <textarea className="cyan-focus min-h-36 rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.message} />
            <NeonButton intent="service" type="button" className="w-full">{dictionary.support.send}</NeonButton>
          </form>
        </section>
        </div>
      </main>
    </>
  );
}
