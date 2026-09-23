"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";

export function AdminSidebar() {
  const { dictionary } = useLanguage();
  const { isTechnician, logout } = useRole();
  const pathname = usePathname();

  // Technicians only get their ticket queue; the other areas are admin-only on the API too.
  const items = [
    { href: "/admin", label: dictionary.admin.nav.dashboard, adminOnly: true },
    { href: "/admin/tickets", label: isTechnician ? dictionary.admin.myTickets : dictionary.admin.nav.tickets, adminOnly: false },
    { href: "/admin/products", label: dictionary.admin.nav.products, adminOnly: true },
    { href: "/admin/users", label: dictionary.admin.nav.users, adminOnly: true }
  ].filter((item) => !(item.adminOnly && isTechnician));

  return (
    <aside className="flex items-center gap-2 overflow-x-auto border-b border-borderTech bg-slatePanel p-4 lg:block lg:overflow-visible lg:border-b-0 lg:border-r lg:p-6">
      <div className="mb-0 flex-shrink-0 text-xl font-black text-buyCyan lg:mb-8 lg:text-2xl">BC Admin</div>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex-shrink-0 rounded-2xl px-4 py-3 text-sm font-bold transition lg:mb-2 lg:block ${
              isActive ? "bg-buyCyan/10 text-buyCyan" : "text-textMuted hover:bg-[rgb(var(--text-main)/0.05)] hover:text-textMain"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="flex-shrink-0 rounded-2xl px-4 py-3 text-sm font-bold text-serviceOrange transition hover:bg-serviceOrange/10 lg:mt-6 lg:block lg:w-full lg:text-left"
      >
        {dictionary.admin.logout}
      </button>
    </aside>
  );
}
