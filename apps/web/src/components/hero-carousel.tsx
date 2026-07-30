"use client";

import { useEffect, useState } from "react";
import { NeonButton } from "@/components/neon-button";
import { useLanguage } from "@/components/language-provider";

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  copy: string;
  cta: string;
  href: string;
  intent: "buy" | "service";
}

const AUTO_ROTATE_MS = 6000;

export function HeroCarousel() {
  const { dictionary } = useLanguage();
  const slides: Slide[] = [
    {
      eyebrow: dictionary.hero.eyebrow,
      title: dictionary.hero.title,
      subtitle: dictionary.hero.subtitle,
      copy: dictionary.hero.copy,
      cta: dictionary.hero.buy,
      href: "/boutique",
      intent: "buy"
    },
    {
      eyebrow: dictionary.heroSlides.repair.eyebrow,
      title: dictionary.heroSlides.repair.title,
      subtitle: dictionary.heroSlides.repair.subtitle,
      copy: dictionary.heroSlides.repair.copy,
      cta: dictionary.heroSlides.repair.cta,
      href: "/reparation",
      intent: "service"
    },
    {
      eyebrow: dictionary.heroSlides.services.eyebrow,
      title: dictionary.heroSlides.services.title,
      subtitle: dictionary.heroSlides.services.subtitle,
      copy: dictionary.heroSlides.services.copy,
      cta: dictionary.heroSlides.services.cta,
      href: "/services",
      intent: "service"
    }
  ];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setActive((value) => (value + 1) % slides.length), AUTO_ROTATE_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, slides.length]);

  const slide = slides[active];
  const accent = slide.intent === "buy" ? "text-buyCyan" : "text-serviceOrange";

  return (
    <section
      className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div>
        <p className={`mb-4 text-sm font-black uppercase tracking-normal transition ${accent}`}>{slide.eyebrow}</p>
        <h1 className="max-w-4xl text-5xl font-black leading-none text-textMain md:text-7xl">
          {slide.title}
          <span className="block bg-gradient-to-r from-buyCyan to-serviceOrange bg-clip-text text-transparent">{slide.subtitle}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-textMuted">{slide.copy}</p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <NeonButton href={slide.href} intent={slide.intent}>
            {slide.cta}
          </NeonButton>
          <div className="flex items-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Slide ${index + 1}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === active ? `w-7 ${item.intent === "buy" ? "bg-buyCyan" : "bg-serviceOrange"}` : "w-2.5 bg-borderTech"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card relative min-h-[420px] overflow-hidden rounded-[2rem] p-6 shadow-cyanGlow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--buy-cyan)/0.18),transparent_18rem),radial-gradient(circle_at_80%_70%,rgb(var(--service-orange)/0.18),transparent_16rem)]" />
        <div className="relative grid h-full place-items-center">
          <div className="grid w-full max-w-md gap-4">
            <div className="ml-auto h-44 w-28 rounded-[2rem] border-4 border-buyCyan bg-void shadow-cyanGlow" />
            <div className="h-40 rounded-3xl border-4 border-borderTech bg-slatePanel shadow-2xl">
              <div className="m-5 h-20 rounded-2xl bg-gradient-to-r from-buyCyan/20 to-serviceOrange/20" />
            </div>
            <div className="mr-auto h-16 w-56 rounded-full border border-serviceOrange bg-serviceOrange/10 shadow-orangeGlow" />
          </div>
        </div>
      </div>
    </section>
  );
}
