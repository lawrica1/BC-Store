"use client";

import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { useTheme } from "@/components/theme-provider";
import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const { dictionary, locale, setLocale } = useLanguage();
  const { isAdmin } = useRole();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const cartCount = useCartStore((state) => state.items.length);

  const links = [
    { href: "/boutique", label: dictionary.nav.shop, intent: "buy" },
    { href: "/reparation", label: dictionary.nav.repair, intent: "service" },
    { href: "/services", label: dictionary.nav.services, intent: "service" },
    { href: "/autre", label: dictionary.nav.other, intent: "buy" },
    ...(isAdmin ? [{ href: "/admin", label: dictionary.nav.admin, intent: "service" }] : []),
    { href: "/support", label: dictionary.nav.support, intent: "service" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-borderTech bg-void/85 backdrop-blur-xl">
      <div className="hidden border-b border-borderTech/60 bg-slatePanel/60 px-5 py-2 lg:block lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 text-xs font-semibold text-textMuted">
          <div className="flex items-center gap-5">
            <a className="transition hover:text-serviceOrange" href="tel:+237659870906">
              {dictionary.utilityBar.contact} · +237 659870906
            </a>
            <Link className="transition hover:text-serviceOrange" to="/support">
              {dictionary.utilityBar.helpCenter}
            </Link>
          </div>
          <span className="text-textMuted/80">{dictionary.utilityBar.tagline}</span>
        </div>
      </div>

      <div className="px-5 py-4 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-buyCyan/60 bg-buyCyan/10 font-black text-buyCyan shadow-cyanGlow">
              BC
            </span>
            <span>
              <span className="block text-base font-bold text-textMain">BC Store</span>
              <span className="block text-xs text-textMuted">BC Tech</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <CartLink count={cartCount} label={dictionary.shop.cart} />
            <button
              type="button"
              className="rounded-full border border-borderTech px-4 py-2 text-sm text-textMain"
              onClick={() => setOpen((value) => !value)}
            >
              Menu
            </button>
          </div>

          <nav className={`${open ? "grid" : "hidden"} absolute left-5 right-5 top-20 gap-4 rounded-3xl border border-borderTech bg-slatePanel p-5 lg:static lg:flex lg:items-center lg:border-0 lg:bg-transparent lg:p-0`}>
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              const activeColor = link.intent === "buy" ? "text-buyCyan border-b-buyCyan" : "text-serviceOrange border-b-serviceOrange";
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`border-b-2 pb-1 text-sm font-semibold transition hover:-translate-y-0.5 ${
                    isActive
                      ? `font-black ${activeColor}`
                      : `border-b-transparent text-textMuted ${link.intent === "buy" ? "hover:text-buyCyan" : "hover:text-serviceOrange"}`
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <a className="rounded-full border border-serviceOrange/50 px-4 py-2 text-sm font-bold text-serviceOrange lg:hidden" href="tel:+237659870906">
              +237 659870906
            </a>
            <select
              className="rounded-full border border-borderTech bg-[rgb(var(--text-main)/0.04)] px-3 py-2 text-sm text-textMain cyan-focus"
              value={locale}
              onChange={(event) => setLocale(event.target.value as "fr" | "en")}
              aria-label="Language"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <CartLink count={cartCount} label={dictionary.shop.cart} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className="grid h-11 w-11 place-items-center rounded-full border border-borderTech bg-[rgb(var(--text-main)/0.04)] text-textMain transition hover:border-buyCyan/60 hover:text-buyCyan"
    >
      {isLight ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
}

function CartLink({ count, label }: { count: number; label: string }) {
  return (
    <Link
      to="/checkout"
      aria-label={label}
      className="relative grid h-11 w-11 place-items-center rounded-full border border-borderTech bg-[rgb(var(--text-main)/0.04)] text-textMain transition hover:border-buyCyan/60 hover:text-buyCyan"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-buyCyan px-1 text-[10px] font-black text-void">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
