"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { fetchTechnicians } from "@/lib/api";

export default function AdminUsersPage() {
  const { dictionary } = useLanguage();
  const { isTechnician, isStaff } = useRole();
  const router = useRouter();
  const copy = dictionary.admin.users;

  useEffect(() => {
    if (isTechnician) router.replace("/admin/tickets");
  }, [isTechnician, router]);

  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: fetchTechnicians,
    enabled: isStaff && !isTechnician
  });

  if (isTechnician) return null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-black text-textMain sm:text-3xl">{dictionary.admin.nav.users}</h1>
      <section className="grid gap-3">
        <h2 className="text-sm font-black uppercase tracking-normal text-textMuted">{copy.technicians}</h2>
        {isLoading ? (
          <Skeleton className="h-14 rounded-xl" />
        ) : !technicians?.length ? (
          <p className="text-sm text-textMuted">{copy.empty}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {technicians.map((technician) => (
              <li key={technician.id} className="glass-card flex items-center justify-between gap-3 rounded-2xl p-4">
                <span className="font-bold text-textMain">{technician.name}</span>
                <Badge variant="outline" className="border-buyCyan/40 text-buyCyan">
                  TECHNICIAN
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
