"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
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
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
        <Breadcrumb items={[{ label: dictionary.nav.home, href: "/" }, { label: dictionary.nav.services }]} />
        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-l-4 border-serviceOrange pl-6">
            <p className="text-sm font-black uppercase tracking-normal text-serviceOrange">BC Tech</p>
            <h1 className="mt-3 text-5xl font-black text-textMain">{dictionary.services.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-textMuted">{dictionary.services.copy}</p>
          </div>
          <form
            className="glass-card grid gap-4 rounded-[2rem] p-6"
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
            <h2 className="text-2xl font-black text-textMain">{dictionary.services.formTitle}</h2>
            <input name="customerName" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.name} required />
            <input name="customerPhone" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.phone} required />
            <input name="address" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.address} required />
            <NeonButton intent="service" type="submit" className="w-full">{dictionary.services.quote}</NeonButton>
          </form>
        </section>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service} className="glass-card lift-glow rounded-3xl p-6 hover:border-serviceOrange/70 hover:shadow-orangeGlow">
              <span className="mb-5 inline-flex rounded-full bg-serviceOrange/10 px-4 py-2 text-sm font-black text-serviceOrange">{dictionary.services.quote}</span>
              <h2 className="text-2xl font-black text-textMain">{service}</h2>
              <ul className="mt-5 grid gap-3 text-sm text-textMuted">
                {dictionary.services.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3"><span className="text-serviceOrange">✓</span>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-black text-textMain">{dictionary.services.portfolio}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[dictionary.services.camera, dictionary.services.electricity, dictionary.services.sound].map((item) => (
              <div key={item} className="glass-card lift-glow grid h-48 place-items-center rounded-3xl border-serviceOrange/20 bg-serviceOrange/5 text-serviceOrange hover:border-serviceOrange/70">
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
