"use client";

import { useState } from "react";
import { ChevronSelectorVertical, LogIn01, LogOut01 } from "@untitledui/icons";
import { Button } from "@/app/components/base/buttons/button";
import { Avatar } from "@/app/components/base/avatar/avatar";
import { API_BASE_URL, normalizeApiUrl } from "@/lib/api";
import { useAuthUser } from "@/app/components/auth-user-provider";

export const DropdownAccountButton = () => {
    const user = useAuthUser();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return <Button size="sm" color="secondary" iconLeading={LogIn01} onPress={() => window.location.assign("/login")}>Sign in</Button>;
    }

    const displayName = user.name || "Account";
    const avatarUrl = normalizeApiUrl(user.avatar) || (user.id ? `${API_BASE_URL}/v1/users/${encodeURIComponent(user.id)}/avatar` : undefined);

    return (
        <div className="relative">
            <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
                <Avatar size="sm" src={avatarUrl} alt={`${displayName} avatar`} initials={displayName.charAt(0).toUpperCase()} />
                <span className="max-w-32 truncate">{displayName}</span>
                <ChevronSelectorVertical className="size-4 text-slate-400" />
            </button>

            {isOpen ? (
                <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <Avatar size="md" src={avatarUrl} alt={`${displayName} avatar`} initials={displayName.charAt(0).toUpperCase()} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => window.location.assign("/logout")}
                        className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                        <LogOut01 className="size-4" />
                        Sign out
                    </button>
                </div>
            ) : null}
        </div>
    );
};
