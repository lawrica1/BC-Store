"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "@bc-store/shared-types";

const ROLE_STORAGE_KEY = "bc-store-role";

interface RoleContextValue {
  role: UserRole;
  isAdmin: boolean;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function normalizeRole(value: unknown): UserRole {
  return value === "ADMIN" || value === "TECHNICIAN" || value === "CUSTOMER" ? value : "CUSTOMER";
}

function detectInitialRole(): UserRole {
  if (typeof window === "undefined") return normalizeRole(import.meta.env.VITE_USER_ROLE);
  const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return normalizeRole(savedRole ?? import.meta.env.VITE_USER_ROLE);
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(detectInitialRole);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      isAdmin: role === "ADMIN",
      setRole(nextRole) {
        window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
        setRoleState(nextRole);
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
