"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: "admin" | "instructor" | "user" | string;
};

function setRoleCookie(role: string | undefined) {
    if (!role) {
        document.cookie = "iqra-role=; Max-Age=0; path=/; SameSite=Lax";
        return;
    }

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `iqra-role=${encodeURIComponent(role)}; path=/; SameSite=Lax${secure}`;
}

const AuthUserContext = createContext<AuthUser | null>(null);

export function AuthUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem("iqra-user");
                const parsedUser = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
                setUser(parsedUser);
                setRoleCookie(parsedUser?.role ?? undefined);
            } catch {
                localStorage.removeItem("iqra-user");
                setRoleCookie(undefined);
                setUser(null);
            }
        };

        loadUser();
        window.addEventListener("iqra-user-changed", loadUser);
        return () => window.removeEventListener("iqra-user-changed", loadUser);
    }, []);

    return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser() {
    return useContext(AuthUserContext);
}
