"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import { X as CloseIcon, Menu02 } from "@untitledui/icons";
import { BookOpen, Home, NotebookText, Phone } from "lucide-react";
import { UntitledLogo } from "@/app/components/foundations/logo/untitledui-logo";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/api";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [siteName, setSiteName] = useState(DEFAULT_SETTINGS.site_name ?? "Iqra International");

    useEffect(() => {
        let isMounted = true;

        getSettings()
            .then((settings) => {
                if (!isMounted) return;
                setSiteName(settings.site_name ?? DEFAULT_SETTINGS.site_name ?? "Iqra International");
            })
            .catch(() => undefined);

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            <header className="relative flex h-16 items-center justify-center border-b border-[#e5e7eb] bg-white px-4 shadow-[0_1px_0_rgba(17,24,39,0.06)] lg:hidden [font-family:var(--font-jost),sans-serif]">
                <UntitledLogo className="absolute left-4 h-5" />
                <span className="text-base font-semibold uppercase tracking-[0.08em] text-[#111827]">{siteName}</span>
            </header>

            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden [font-family:var(--font-jost),sans-serif]">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-end gap-1 border-t border-[#e5e7eb] bg-white px-2 pb-2 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
                    <a
                        href="/"
                        className="mx-auto mt-[-0.5rem] flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-full bg-[#2563eb] text-[10px] font-bold tracking-[0.02em] text-white shadow-[0_12px_20px_rgba(37,99,235,0.25)] transition hover:bg-[#1d4ed8]"
                    >
                        <Home className="size-5 shrink-0" />
                        <span>Home</span>
                    </a>

                    <a href="/courses" className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-2 text-[10px] font-bold tracking-[0.02em] text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]">
                        <BookOpen className="size-5 shrink-0" />
                        <span>Courses</span>
                    </a>

                    <a href="/contactus" className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-2 text-[10px] font-bold tracking-[0.02em] text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]">
                        <Phone className="size-5 shrink-0" />
                        <span>Contact</span>
                    </a>

                    <a href="/blog" className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-2 text-[10px] font-bold tracking-[0.02em] text-[#374151] transition hover:bg-[#f3f4f6] hover:text-[#111827]">
                        <NotebookText className="size-5 shrink-0" />
                        <span>Blog</span>
                    </a>

                    <button
                        type="button"
                        aria-label="Expand navigation menu"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((value) => !value)}
                        className="group relative mx-auto mt-[-0.5rem] flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-full bg-[#0f172a] text-[10px] font-bold tracking-[0.02em] text-white shadow-[0_12px_20px_rgba(15,23,42,0.2)] transition hover:bg-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <Menu02 className={`size-5 shrink-0 transition duration-200 ease-in-out ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
                        <span>Menu</span>
                        <CloseIcon className={`absolute size-4 transition duration-200 ease-in-out ${isMenuOpen ? "opacity-100" : "opacity-0"}`} />
                    </button>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)}>
                    <div
                        className="h-full w-full max-w-[18rem] cursor-auto overflow-hidden rounded-r-3xl border-r border-[#e5e7eb] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.18)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="w-full [font-family:var(--font-jost),sans-serif]">
                            <button
                                type="button"
                                aria-label="Close navigation menu"
                                onClick={() => setIsMenuOpen(false)}
                                className="fixed right-3 top-2.5 flex cursor-pointer items-center justify-center rounded-full bg-white/90 p-2 text-[#374151] shadow-sm hover:bg-white hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                <CloseIcon className="size-6" />
                            </button>
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
