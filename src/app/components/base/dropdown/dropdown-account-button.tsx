"use client";

import { LogIn01, LogOut01 } from "@untitledui/icons";
import { Button } from "@/app/components/base/buttons/button";
import { Avatar } from "@/app/components/base/avatar/avatar";
import { API_BASE_URL } from "@/lib/api";
import { useAuthUser } from "@/app/components/auth-user-provider";

export const DropdownAccountButton = () => {
    const user = useAuthUser();

    if (!user) {
        return <Button size="sm" color="secondary" iconLeading={LogIn01} onPress={() => window.location.assign("/login")}>Sign in</Button>;
    }

    const displayName = user.name || "Account";
    const avatarUrl = user.avatar || (user.id ? `${API_BASE_URL}/v1/users/${encodeURIComponent(user.id)}/avatar` : undefined);

    return <Button size="sm" color="secondary" iconLeading={LogOut01} onPress={() => window.location.assign("/logout")}><span className="flex items-center gap-2"><Avatar size="sm" src={avatarUrl} alt={`${displayName} avatar`} initials={displayName.charAt(0).toUpperCase()} /><span className="max-w-32 truncate">Sign out</span></span></Button>;
};
