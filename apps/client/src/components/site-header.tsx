"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, ShoppingCart, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { useTheme } from "@/components/theme-provider";
import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const { dictionary, locale, setLocale } = useLanguage();
  const { isStaff } = useRole();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.items.length);

  const links = [
    { href: "/", label: dictionary.nav.home, intent: "buy" },
    { href: "/boutique", label: dictionary.nav.shop, intent: "buy" },
    { href: "/reparation", label: dictionary.nav.repair, intent: "service" },
    { href: "/services", label: dictionary.nav.services, intent: "service" },
    { href: "/autre", label: dictionary.nav.other, intent: "buy" },
    { href: "/suivi", label: dictionary.nav.track, intent: "buy" },
    ...(isStaff ? [{ href: "/admin", label: dictionary.nav.admin, intent: "service" }] : []),
    { href: "/support", label: dictionary.nav.support, intent: "service" }
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-borderTech bg-void/85 backdrop-blur-xl">
      <div className="hidden border-b border-borderTech/60 bg-slatePanel/60 px-5 py-2 lg:block lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 text-xs font-semibold text-textMuted">
          <div className="flex items-center gap-5">
            <a className="transition hover:text-serviceOrange" href="tel:+237659870906">
              {dictionary.utilityBar.contact} · +237 659870906
            </a>
            <Link className="transition hover:text-serviceOrange" href="/support">
              {dictionary.utilityBar.helpCenter}
            </Link>
          </div>
          <span className="text-textMuted/80">{dictionary.utilityBar.tagline}</span>
        </div>
      </div>

      <div className="px-4 py-3 sm:px-5 sm:py-4 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-5">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-buyCyan/60 bg-buyCyan/10 font-black text-buyCyan shadow-cyanGlow sm:h-11 sm:w-11">
              BC
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-textMain sm:text-base">BC Store</span>
              <span className="hidden text-xs text-textMuted sm:block">BC Tech</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const activeColor = link.intent === "buy" ? "text-buyCyan border-b-buyCyan" : "text-serviceOrange border-b-serviceOrange";
              return (
                <Link
                  key={link.href}
                  href={link.href}
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
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Select value={locale} onValueChange={(value) => setLocale(value as "fr" | "en")}>
              <SelectTrigger
                aria-label="Language"
                className="hidden h-9 w-[4.5rem] border-borderTech bg-[rgb(var(--text-main)/0.04)] text-xs text-textMain sm:flex"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              size="icon"
              className="border-borderTech bg-[rgb(var(--text-main)/0.04)] text-textMain hover:border-buyCyan/60 hover:text-buyCyan"
            >
              <Link href="/compte" aria-label={dictionary.nav.account}>
                <User className="h-[18px] w-[18px]" />
              </Link>
            </Button>
            <CartLink count={cartCount} label={dictionary.shop.cart} />

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Open menu"
                  className="border-borderTech bg-[rgb(var(--text-main)/0.04)] text-textMain hover:border-buyCyan/60 hover:text-buyCyan lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] border-borderTech bg-slatePanel text-textMain sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle className="text-textMain">BC Store</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 grid gap-1">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    const activeColor = link.intent === "buy" ? "text-buyCyan" : "text-serviceOrange";
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`rounded-2xl px-4 py-3 text-base font-bold transition ${
                          isActive ? `bg-[rgb(var(--text-main)/0.05)] ${activeColor}` : "text-textMuted hover:bg-[rgb(var(--text-main)/0.05)] hover:text-textMain"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-6 grid gap-3 border-t border-borderTech pt-6">
                  <a
                    href="tel:+237659870906"
                    className="rounded-full border border-serviceOrange/50 px-4 py-3 text-center text-sm font-bold text-serviceOrange"
                  >
                    +237 659870906
                  </a>
                  <Select value={locale} onValueChange={(value) => setLocale(value as "fr" | "en")}>
                    <SelectTrigger aria-label="Language" className="w-full border-borderTech bg-void text-textMain">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      // theme is only known for certain after mount (see theme-provider) — this button's aria-label
      // and icon legitimately differ between the server render and the first client render.
      suppressHydrationWarning
      className="border-borderTech bg-[rgb(var(--text-main)/0.04)] text-textMain hover:border-buyCyan/60 hover:text-buyCyan"
    >
      <span suppressHydrationWarning>{isLight ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</span>
    </Button>
  );
}

function CartLink({ count, label }: { count: number; label: string }) {
  return (
    <Button asChild variant="outline" size="icon" className="relative border-borderTech bg-[rgb(var(--text-main)/0.04)] text-textMain hover:border-buyCyan/60 hover:text-buyCyan">
      <Link href="/checkout" aria-label={label}>
        <ShoppingCart className="h-[18px] w-[18px]" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-buyCyan px-1 text-[10px] font-black text-void">
            {count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
