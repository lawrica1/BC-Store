"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "@bc-store/shared-types";
import { clearToken, decodeToken, getToken, login as apiLogin } from "@/lib/auth";

interface RoleContextValue {
  role: UserRole;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function detectInitialRole(): UserRole {
  const token = getToken();
  if (!token) return "CUSTOMER";
  const payload = decodeToken(token);
  return payload?.role ?? "CUSTOMER";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(detectInitialRole);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      isAdmin: role === "ADMIN" || role === "TECHNICIAN",
      isAuthenticated: role !== "CUSTOMER",
      async login(email, password) {
        const { user } = await apiLogin(email, password);
        setRole(user.role);
      },
      logout() {
        clearToken();
        setRole("CUSTOMER");
      }
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return context;
}
