"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/language-provider";
import { OfflineBanner } from "@/components/offline-banner";
import { QueryProvider } from "@/components/query-provider";
import { RoleProvider } from "@/components/role-provider";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RoleProvider>
          <LanguageProvider>
            <OfflineBanner />
            {children}
          </LanguageProvider>
        </RoleProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
