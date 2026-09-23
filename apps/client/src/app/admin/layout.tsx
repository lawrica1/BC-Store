"use client";

import type { ReactNode } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { useRole } from "@/components/role-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isStaff } = useRole();

  if (!isStaff) return <AdminLogin />;

  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <section className="min-w-0 p-4 sm:p-5 lg:p-10">{children}</section>
      </main>
    </>
  );
}
