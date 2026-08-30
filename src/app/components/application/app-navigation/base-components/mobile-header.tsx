"use client";

import type { PropsWithChildren } from "react";
import { X as CloseIcon, Menu02 } from "@untitledui/icons";
import { BookOpen, Home, NotebookText, Phone } from "lucide-react";
import {
    Button as AriaButton,
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { UntitledLogo } from "@/app/components/foundations/logo/untitledui-logo";
import { cx } from "@/lib/utils/cx";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
    return (
        <AriaDialogTrigger>
            <header className="relative flex h-16 items-center justify-center border-b border-[#e5e7eb] bg-white px-4 shadow-[0_1px_0_rgba(17,24,39,0.06)] lg:hidden [font-family:var(--font-jost),sans-serif]">
                <UntitledLogo className="absolute left-4 h-5" />
                <span className="text-base font-semibold tracking-[0.08em] text-[#111827] uppercase">iqra international</span>
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

                    <AriaButton
                        aria-label="Expand navigation menu"
                        className="group mx-auto mt-[-0.5rem] flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-full bg-[#0f172a] text-[10px] font-bold tracking-[0.02em] text-white shadow-[0_12px_20px_rgba(15,23,42,0.2)] outline-focus-ring hover:bg-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <Menu02 className="size-5 shrink-0 transition duration-200 ease-in-out group-aria-expanded:opacity-0" />
                        <span>Menu</span>
                        <CloseIcon className="absolute size-4 opacity-0 transition duration-200 ease-in-out group-aria-expanded:opacity-100" />
                    </AriaButton>
                </div>
            </nav>

            <AriaModalOverlay
                isDismissable
                className={({ isEntering, isExiting }) =>
                    cx(
                        "fixed inset-0 z-50 cursor-pointer bg-slate-950/20 pr-16 backdrop-blur-sm lg:hidden",
                        isEntering && "duration-300 ease-in-out animate-in fade-in",
                        isExiting && "duration-200 ease-in-out animate-out fade-out",
                    )
                }
            >
                {({ state }) => (
                    <>
                        <AriaButton
                            aria-label="Close navigation menu"
                            onPress={() => state.close()}
                            className="fixed top-2.5 right-3 flex cursor-pointer items-center justify-center rounded-full bg-white/90 p-2 text-[#374151] shadow-sm outline-focus-ring hover:bg-white hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <CloseIcon className="size-6" />
                        </AriaButton>

                        <AriaModal className="w-full max-w-74 cursor-auto will-change-transform [font-family:var(--font-jost),sans-serif]">
                            <AriaDialog className="h-dvh overflow-hidden rounded-r-3xl border-r border-[#e5e7eb] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.18)] outline-hidden focus:outline-hidden">{children}</AriaDialog>
                        </AriaModal>
                    </>
                )}
            </AriaModalOverlay>
        </AriaDialogTrigger>
    );
};
