"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AccountForm } from "@/components/account-form";
import { NeonButton } from "@/components/neon-button";
import { OrderCard } from "@/components/order-card";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { fetchMyOrders } from "@/lib/api";

export default function AccountPage() {
  const { dictionary } = useLanguage();
  const { isLoggedIn, isStaff, userId, logout } = useRole();
  const copy = dictionary.account;

  const { data: orders, isLoading } = useQuery({
    // Keyed by user so a different login never sees the previous account's cached orders.
    queryKey: ["my-orders", userId],
    queryFn: fetchMyOrders,
    enabled: isLoggedIn && !isStaff
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-12">
        <div className="grid gap-6">
          <h1 className="text-center text-2xl font-black text-textMain sm:text-3xl">{copy.title}</h1>

          {!isLoggedIn ? (
            <AccountForm />
          ) : isStaff ? (
            <div className="glass-card grid gap-4 rounded-3xl p-5 text-center">
              <p className="text-textMuted">{copy.staffNote}</p>
              <NeonButton href="/admin" intent="service" className="justify-self-center">
                {dictionary.nav.admin}
              </NeonButton>
            </div>
          ) : (
            <section className="grid gap-4" aria-label={copy.myOrders}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black uppercase tracking-normal text-textMuted">{copy.myOrders}</h2>
                <button type="button" onClick={logout} className="text-sm font-bold text-serviceOrange hover:underline">
                  {copy.logout}
                </button>
              </div>
              {isLoading ? (
                <Skeleton className="h-40 rounded-3xl" />
              ) : orders?.length ? (
                orders.map((order) => <OrderCard key={order.orderNumber} order={order} />)
              ) : (
                <div className="glass-card grid gap-4 rounded-3xl p-5 text-center">
                  <p className="text-textMuted">{copy.noOrders}</p>
                  <NeonButton href="/boutique" intent="buy" className="justify-self-center">
                    {dictionary.nav.shop}
                  </NeonButton>
                </div>
              )}
              <Link href="/suivi" className="text-center text-sm font-bold text-buyCyan hover:underline">
                {dictionary.nav.track}
              </Link>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
