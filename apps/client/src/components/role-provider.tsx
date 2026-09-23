"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "@bc-store/shared-types";
import { clearToken, decodeToken, getToken, login as apiLogin, register as apiRegister } from "@/lib/auth";
import type { RegisterInput } from "@/lib/auth";

interface RoleContextValue {
  role: UserRole;
  userId: string | null;
  /** Anyone with a valid session, customers included. */
  isLoggedIn: boolean;
  /** Admin or technician — the only people allowed into /admin. */
  isStaff: boolean;
  isTechnician: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

interface Identity {
  role: UserRole;
  userId: string | null;
}

const ANONYMOUS: Identity = { role: "CUSTOMER", userId: null };

const RoleContext = createContext<RoleContextValue | null>(null);

function detectIdentity(): Identity {
  const token = getToken();
  if (!token) return ANONYMOUS;
  const payload = decodeToken(token);
  return payload ? { role: payload.role, userId: payload.sub } : ANONYMOUS;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  // Starts anonymous (matching SSR, which has no access to localStorage) then upgrades
  // right after mount — reading the token during the initializer would desync server/client
  // hydration output (e.g. the admin nav link) since it depends on browser-only storage.
  const [identity, setIdentity] = useState<Identity>(ANONYMOUS);

  useEffect(() => {
    setIdentity(detectIdentity());
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      role: identity.role,
      userId: identity.userId,
      isLoggedIn: identity.userId !== null,
      isStaff: identity.role === "ADMIN" || identity.role === "TECHNICIAN",
      isTechnician: identity.role === "TECHNICIAN",
      async login(email, password) {
        const { user } = await apiLogin(email, password);
        setIdentity({ role: user.role, userId: user.id });
      },
      async register(input) {
        const { user } = await apiRegister(input);
        setIdentity({ role: user.role, userId: user.id });
      },
      logout() {
        clearToken();
        setIdentity(ANONYMOUS);
      }
    }),
    [identity]
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
