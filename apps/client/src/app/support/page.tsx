"use client";

import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import { STORE_COORDINATES } from "@/lib/geofence";

const StoreMap = dynamic(() => import("@/components/store-map").then((m) => m.StoreMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-80 w-full animate-pulse rounded-2xl border border-buyCyan/20 bg-slatePanel/60" />
});

export default function SupportPage() {
  const { dictionary } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[60fr_40fr]">
        <section className="glass-card grid min-h-[320px] gap-4 rounded-3xl p-4 shadow-cyanGlow sm:min-h-[400px] sm:p-6">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-normal text-textMuted">{dictionary.support.title}</p>
            <h1 className="mt-1 text-xl font-black text-buyCyan">{dictionary.support.map}</h1>
          </div>
          <StoreMap storeCoords={STORE_COORDINATES} storeLabel={dictionary.geofence.mapStoreLabel} />
        </section>
        <section className="glass-card rounded-3xl p-4 sm:p-6">
          <p className="text-sm font-black uppercase tracking-normal text-serviceOrange">{dictionary.support.call}</p>
          <a href="tel:+237650000000" className="mt-4 block text-2xl font-black text-serviceOrange animate-pulse sm:text-3xl lg:text-4xl">+237 659870906</a>
          <form className="mt-8 grid gap-4">
            <Input className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.name} />
            <Input className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.phone} />
            <Textarea className="min-h-36 rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.message} />
            <NeonButton intent="service" type="button" className="w-full">{dictionary.support.send}</NeonButton>
          </form>
        </section>
        </div>
      </main>
    </>
  );
}
