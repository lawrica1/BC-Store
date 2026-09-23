"use client";

import { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
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

  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) api.scrollNext();
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [api]);

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-10 sm:px-5 sm:py-16 lg:px-10"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map((slide) => {
            const accent = slide.intent === "buy" ? "text-buyCyan" : "text-serviceOrange";
            return (
              <CarouselItem key={slide.title}>
                <div className="grid min-h-[calc(100vh-220px)] items-center gap-8 sm:min-h-[calc(100vh-180px)] lg:grid-cols-[1.05fr_0.95fr]">
                  <div>
                    <p className={`mb-3 text-xs font-black uppercase tracking-normal transition sm:text-sm ${accent}`}>{slide.eyebrow}</p>
                    <h1 className="max-w-4xl text-3xl font-black leading-none text-textMain sm:text-4xl md:text-5xl lg:text-6xl">
                      {slide.title}
                      <span className="block bg-gradient-to-r from-buyCyan to-serviceOrange bg-clip-text text-transparent">
                        {slide.subtitle}
                      </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-textMuted sm:text-lg">{slide.copy}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
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
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2.5 rounded-full transition-all ${
                              index === active ? `w-7 ${item.intent === "buy" ? "bg-buyCyan" : "bg-serviceOrange"}` : "w-2.5 bg-borderTech"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="glass-card relative min-h-[320px] overflow-hidden rounded-3xl p-5 shadow-cyanGlow sm:min-h-[360px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--buy-cyan)/0.18),transparent_18rem),radial-gradient(circle_at_80%_70%,rgb(var(--service-orange)/0.18),transparent_16rem)]" />
                    <div className="relative grid h-full place-items-center">
                      <div className="grid w-full max-w-sm gap-3">
                        <div className="ml-auto h-32 w-20 rounded-3xl border-4 border-buyCyan bg-void shadow-cyanGlow" />
                        <div className="h-28 rounded-2xl border-4 border-borderTech bg-slatePanel shadow-2xl">
                          <div className="m-4 h-14 rounded-xl bg-gradient-to-r from-buyCyan/20 to-serviceOrange/20" />
                        </div>
                        <div className="mr-auto h-12 w-40 rounded-full border border-serviceOrange bg-serviceOrange/10 shadow-orangeGlow" />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
