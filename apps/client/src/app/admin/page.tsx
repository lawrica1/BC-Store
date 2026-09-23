"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Kpi } from "@/components/admin/kpi";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { fetchDashboardStats } from "@/lib/api";
import { formatXaf } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { dictionary, locale } = useLanguage();
  const { isTechnician, isStaff } = useRole();
  const router = useRouter();
  const copy = dictionary.admin.dashboard;

  useEffect(() => {
    if (isTechnician) router.replace("/admin/tickets");
  }, [isTechnician, router]);

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboardStats,
    enabled: isStaff && !isTechnician
  });

  if (isTechnician) return null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-black text-textMain sm:text-3xl">{dictionary.admin.title}</h1>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : isError || !stats ? (
        <p className="text-sm font-bold text-red-400">Impossible de charger les statistiques.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Kpi label={dictionary.admin.revenue} value={formatXaf(Number(stats.orders.revenue), locale)} accent="cyan" />
            <Kpi label={copy.orders} value={String(stats.orders.paidOrders)} accent="cyan" />
            <Kpi label={copy.clients} value={String(stats.clients.total)} accent="orange" />
            <Kpi label={dictionary.admin.lowStock} value={String(stats.products.lowStockCount)} accent="orange" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="glass-card rounded-2xl p-4">
              <h2 className="mb-3 text-sm font-black uppercase tracking-normal text-textMuted">{copy.recentOrders}</h2>
              {stats.orders.recent.length ? (
                <ul className="grid gap-2">
                  {stats.orders.recent.map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-3 border-b border-borderTech pb-2 text-sm last:border-none">
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-textMain">{order.customerName}</span>
                        <span className="text-xs text-textMuted">{order.orderNumber}</span>
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-2">
                        <strong className="text-buyCyan">{formatXaf(Number(order.total), locale)}</strong>
                        <Badge variant={order.status === "PAID" ? "success" : "outline"} className="text-[10px]">
                          {order.status}
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-textMuted">{copy.noOrders}</p>
              )}
            </section>

            <section className="glass-card rounded-2xl p-4">
              <h2 className="mb-3 text-sm font-black uppercase tracking-normal text-textMuted">{copy.lowStock}</h2>
              {stats.products.lowStock.length ? (
                <ul className="grid gap-2">
                  {stats.products.lowStock.map((product) => (
                    <li key={product.id} className="flex items-center justify-between gap-3 border-b border-borderTech pb-2 text-sm last:border-none">
                      <span className="truncate font-bold text-textMain">{product.name}</span>
                      <span className="flex-shrink-0 font-black text-serviceOrange">
                        {product.stock} {copy.units}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-textMuted">{copy.noLowStock}</p>
              )}
            </section>
          </div>

          <section className="glass-card rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-black uppercase tracking-normal text-textMuted">{copy.recentClients}</h2>
            {stats.clients.recent.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {stats.clients.recent.map((client) => (
                  <li key={client.phone} className="rounded-xl border border-borderTech p-3 text-sm">
                    <span className="block font-bold text-textMain">{client.name}</span>
                    <span className="text-xs text-textMuted">
                      {client.phone} · {client.orders} cmd · {client.tickets} tickets
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-textMuted">{copy.noClients}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
