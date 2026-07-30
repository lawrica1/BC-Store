import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/components/language-provider";
import { OfflineBanner } from "@/components/offline-banner";
import { QueryProvider } from "@/components/query-provider";
import { RoleProvider, useRole } from "@/components/role-provider";
import { ThemeProvider } from "@/components/theme-provider";
import AdminPage from "@/app/admin/page";
import AdminLoginPage from "@/app/admin/login";
import OtherPage from "@/app/autre/page";
import BoutiquePage from "@/app/boutique/page";
import ProductDetailPage from "@/app/boutique/[slug]/page";
import CheckoutPage from "@/app/checkout/page";
import HomePage from "@/app/page";
import RepairPage from "@/app/reparation/page";
import ServicesPage from "@/app/services/page";
import SupportPage from "@/app/support/page";
import "@/app/globals.css";

function AdminRoute() {
  const { isAdmin } = useRole();
  return isAdmin ? <AdminPage /> : <AdminLoginPage />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <RoleProvider>
          <LanguageProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <OfflineBanner />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/boutique" element={<BoutiquePage />} />
                <Route path="/boutique/:slug" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/reparation" element={<RepairPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/autre" element={<OtherPage />} />
                <Route path="/admin" element={<AdminRoute />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </RoleProvider>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
