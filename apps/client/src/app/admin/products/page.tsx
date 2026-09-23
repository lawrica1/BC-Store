"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductsPanel } from "@/components/admin/products-panel";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";

export default function AdminProductsPage() {
  const { dictionary } = useLanguage();
  const { isTechnician } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isTechnician) router.replace("/admin/tickets");
  }, [isTechnician, router]);

  if (isTechnician) return null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-black text-textMain sm:text-3xl">{dictionary.admin.nav.products}</h1>
      <ProductsPanel />
    </div>
  );
}
