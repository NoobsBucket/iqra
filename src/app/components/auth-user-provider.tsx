"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
};

const AuthUserContext = createContext<AuthUser | null>(null);

export function AuthUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem("iqra-user");
                setUser(storedUser ? (JSON.parse(storedUser) as AuthUser) : null);
            } catch {
                localStorage.removeItem("iqra-user");
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
