"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { createServiceRequest } from "@/lib/api";

export default function ServicesPage() {
  const { dictionary } = useLanguage();
  const [toast, setToast] = useState("");
  const services = [
    dictionary.services.camera,
    dictionary.services.electricity,
    dictionary.services.sound
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-12 lg:px-10">
        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-l-4 border-serviceOrange pl-6">
            <p className="text-sm font-black uppercase tracking-normal text-serviceOrange">BC Tech</p>
            <h1 className="mt-3 text-2xl font-black text-textMain sm:text-3xl lg:text-4xl">{dictionary.services.title}</h1>
            <p className="mt-4 max-w-2xl text-base text-textMuted sm:text-lg">{dictionary.services.copy}</p>
          </div>
          <form
            className="glass-card grid gap-4 rounded-3xl p-4 sm:p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              try {
                await createServiceRequest({
                  serviceType: "CAMERA",
                  customerName: String(form.get("customerName") ?? ""),
                  customerPhone: String(form.get("customerPhone") ?? ""),
                  description: String(form.get("address") ?? "")
                });
                setToast(dictionary.other.sent);
                event.currentTarget.reset();
              } catch (error) {
                setToast(error instanceof Error ? error.message : "Request failed");
              }
            }}
          >
            <h2 className="text-lg font-black text-textMain sm:text-xl">{dictionary.services.formTitle}</h2>
            <Input name="customerName" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.name} required />
            <Input name="customerPhone" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.phone} required />
            <Input name="address" className="rounded-2xl border-borderTech bg-void text-textMain" placeholder={dictionary.fields.address} required />
            <NeonButton intent="service" type="submit" className="w-full">{dictionary.services.quote}</NeonButton>
          </form>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service} className="glass-card lift-glow rounded-2xl p-4 hover:border-serviceOrange/70 hover:shadow-orangeGlow">
              <span className="mb-4 inline-flex rounded-full bg-serviceOrange/10 px-3 py-1.5 text-xs font-black text-serviceOrange">{dictionary.services.quote}</span>
              <h2 className="text-xl font-black text-textMain">{service}</h2>
              <ul className="mt-4 grid gap-2 text-sm text-textMuted">
                {dictionary.services.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3"><span className="text-serviceOrange">✓</span>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-black text-textMain">{dictionary.services.portfolio}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[dictionary.services.camera, dictionary.services.electricity, dictionary.services.sound].map((item) => (
              <div key={item} className="glass-card lift-glow grid h-36 place-items-center rounded-2xl border-serviceOrange/20 bg-serviceOrange/5 text-serviceOrange hover:border-serviceOrange/70">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-serviceOrange bg-slatePanel p-4 text-sm font-bold text-textMain shadow-orangeGlow">
          {toast}
        </div>
      ) : null}
    </>
  );
}
