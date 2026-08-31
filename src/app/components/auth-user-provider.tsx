"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
};

const STORAGE_KEY = "iqra-user";
const AuthUserContext = createContext<AuthUser | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed || typeof parsed !== "object") return null;

    const id = typeof parsed.id === "string" ? parsed.id : "";
    const name = typeof parsed.name === "string" ? parsed.name : "Account";
    const email = typeof parsed.email === "string" ? parsed.email : "";

    if (!id && !email) return null;

    return {
      id,
      name,
      email,
      avatar: typeof parsed.avatar === "string" ? parsed.avatar : undefined,
      role: typeof parsed.role === "string" ? parsed.role : undefined,
    };
  } catch {
    return null;
  }
}

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(readStoredUser());
    };

    syncUser();

    window.addEventListener("iqra-user-changed", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("iqra-user-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const value = useMemo(() => user, [user]);

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
  return useContext(AuthUserContext);
}