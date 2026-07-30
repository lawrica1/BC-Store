"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
import { useLanguage } from "@/components/language-provider";
import { createServiceRequest } from "@/lib/api";

export default function OtherPage() {
  const { dictionary } = useLanguage();
  const [toast, setToast] = useState("");

  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[calc(100vh-80px)] place-items-center px-5 py-12">
        <div className="w-full max-w-2xl">
        <Breadcrumb items={[{ label: dictionary.nav.home, href: "/" }, { label: dictionary.nav.other }]} />
        <form
          className="glass-card grid w-full max-w-2xl gap-5 rounded-[2rem] p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              await createServiceRequest({
                serviceType: "AUTRE",
                customerName: String(form.get("customerName") ?? ""),
                customerPhone: String(form.get("customerPhone") ?? ""),
                description: String(form.get("description") ?? "")
              });
              setToast(dictionary.other.sent);
              event.currentTarget.reset();
            } catch (error) {
              setToast(error instanceof Error ? error.message : "Request failed");
            }
          }}
        >
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-normal text-buyCyan">{dictionary.nav.other}</p>
            <h1 className="mt-2 text-4xl font-black text-textMain">{dictionary.other.title}</h1>
          </div>
          <input name="customerName" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.name} required />
          <input name="customerPhone" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.phone} required />
          <textarea name="description" className="cyan-focus min-h-40 rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" placeholder={dictionary.fields.message} required />
          <div className="grid min-h-32 place-items-center rounded-3xl border border-dashed border-white/40 text-sm text-textMuted">
            {dictionary.other.upload}
          </div>
          <NeonButton intent="ghost" type="submit" className="w-full border-buyCyan text-buyCyan">{dictionary.other.submit}</NeonButton>
        </form>
        </div>
        {toast ? (
          <div className="fixed bottom-5 right-5 rounded-2xl border border-buyCyan bg-slatePanel p-4 text-sm font-bold text-textMain shadow-cyanGlow">
            {toast}
          </div>
        ) : null}
      </main>
    </>
  );
}
