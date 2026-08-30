"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, LogOut01, Moon01, Plus, Settings01, User01 } from "@untitledui/icons";
import type { Selection } from "react-aria-components";
import { SubmenuTrigger } from "react-aria-components";
import { Button } from "@/app/components/base/buttons/button";
import { Dropdown } from "@/app/components/base/dropdown/dropdown";
import { Avatar } from "@/app/components/base/avatar/avatar";
import { API_BASE_URL } from "@/lib/api";
import { useAuthUser } from "@/app/components/auth-user-provider";

export const DropdownAccountButton = () => {
    const [selectedAccount, setSelectedAccount] = useState<Selection>(new Set(["olivia"]));
    const [selectedTheme, setSelectedTheme] = useState<Selection>(new Set(["light-mode"]));
    const user = useAuthUser();

    const displayName = user?.name ?? "Account";
    const avatarUrl = user?.id ? `${API_BASE_URL}/v1/users/${encodeURIComponent(user.id)}/avatar` : undefined;

    return (
        <Dropdown.Root>
            <Button
                size="sm"
                className="group rounded-full border border-[#e5e7eb] bg-white text-[#111827] shadow-sm hover:bg-[#f5f7fb] hover:text-[#111827]"
                color="secondary"
                iconTrailing={(props) => <ChevronDown data-icon="trailing" {...props} className="size-4! stroke-[2.25px]!" />}
            >
                <span className="flex items-center gap-2">
                    <Avatar size="sm" src={avatarUrl} alt={`${displayName} avatar`} initials={displayName.charAt(0).toUpperCase()} />
                    <span className="max-w-32 truncate">{displayName}</span>
                </span>
            </Button>

            <Dropdown.Popover className="w-64 rounded-2xl bg-white/95 p-1 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm [font-family:var(--font-jost),sans-serif]">
                <Dropdown.Menu className="rounded-2xl bg-white p-1">
                    <Dropdown.Item icon={User01} addon="⌘K->P" className="text-[#111827]">
                        View profile
                    </Dropdown.Item>
                    <Dropdown.Item icon={Settings01} addon="⌘S" className="text-[#111827]">
                        Settings
                    </Dropdown.Item>
                    <Dropdown.Section selectionMode="single" selectedKeys={selectedTheme} onSelectionChange={setSelectedTheme}>
                        <Dropdown.Item id="dark-mode" icon={Moon01} selectionIndicator="toggle" className="text-[#111827]">
                            Dark mode
                        </Dropdown.Item>
                    </Dropdown.Section>
                    <SubmenuTrigger>
                        <Dropdown.Item icon={HelpCircle} className="text-[#111827]">Support</Dropdown.Item>

                        <Dropdown.Popover placement="right top" offset={-6} className="rounded-2xl bg-white/95 p-1 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                            <Dropdown.Menu className="rounded-2xl bg-white p-1">
                                <Dropdown.Item className="text-[#111827]">Help center</Dropdown.Item>
                                <Dropdown.Item className="text-[#111827]">Contact support</Dropdown.Item>
                                <Dropdown.Item className="text-[#111827]">Send feedback</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </SubmenuTrigger>

                    <Dropdown.Separator className="bg-[#e5e7eb]" />

                    <Dropdown.Section selectionMode="single" selectedKeys={selectedAccount} onSelectionChange={setSelectedAccount}>
                        <Dropdown.SectionHeader className="px-4 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                            Switch account
                        </Dropdown.SectionHeader>

                        <Dropdown.Item id="olivia" avatarUrl="https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80" selectionIndicator="radio" className="text-[#111827]">
                            Olivia Rhye
                        </Dropdown.Item>
                        <Dropdown.Item id="sienna" avatarUrl="https://www.untitledui.com/images/avatars/sienna-hewitt?fm=webp&q=80" selectionIndicator="radio" className="text-[#111827]">
                            Sienna Hewitt
                        </Dropdown.Item>
                    </Dropdown.Section>
                    <Dropdown.Item icon={Plus} className="text-[#111827]">Add account</Dropdown.Item>
                </Dropdown.Menu>
                <div className="flex flex-col gap-2 border-t border-[#e5e7eb] p-3 pt-2">
                    <Button size="xs" color="secondary" iconLeading={LogOut01} onPress={() => window.location.assign("/logout")} className="text-center rounded-xl border border-[#e5e7eb] bg-[#f8fafc] text-[#111827] hover:bg-[#eef2ff]">
                        Sign out
                    </Button>
                </div>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};
