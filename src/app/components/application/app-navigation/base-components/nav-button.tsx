"use client";

import type { FC, MouseEventHandler, ReactNode } from "react";
import { Pressable } from "react-aria-components";
import { Tooltip } from "@/app/components/base/tooltip/tooltip";
import { cx } from "@/lib/utils/cx";

interface NavButtonProps {
    /** Whether the collapsible nav item is open. */
    open?: boolean;
    /** URL to navigate to when the button is clicked. */
    href?: string;
    /** Label text for the button. */
    label?: string;
    /** Icon component to display. */
    icon?: FC<{ className?: string }>;
    /** Whether the button is currently active. */
    current?: boolean;
    /** Handler for click events. */
    onClick?: MouseEventHandler;
    /** Additional CSS classes to apply to the button. */
    className?: string;
    /** Placement of the tooltip. */
    tooltipPlacement?: "top" | "right" | "bottom" | "left";
    /** Content to display. */
    children?: ReactNode;
}

export const NavButton = ({ current, label, href, icon: Icon, className, tooltipPlacement = "right", onClick, children }: NavButtonProps) => {
    const iconOnly = !children;

    return (
        <Tooltip isDisabled={!label} title={label} placement={tooltipPlacement}>
            <Pressable>
                <a
                    href={href}
                    aria-label={label}
                    onClick={onClick}
                    className={cx(
                        "group/item relative flex w-full cursor-pointer items-center justify-center gap-1 rounded-full bg-white text-[#111827] outline-focus-ring transition duration-200 ease-linear select-none hover:bg-[#f5f5f5] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
                        current && "bg-[#f3f4f6] text-[#111827] hover:bg-[#eceef2]",
                        iconOnly ? "size-10" : "px-3 py-2.5",
                        className,
                    )}
                >
                    {Icon && (
                        <Icon
                            aria-hidden="true"
                            className={cx(
                                "size-5 shrink-0 text-[#4b5563] transition duration-200 group-hover/item:text-[#111827]",
                                current && "text-[#111827]",
                            )}
                        />
                    )}

                    {children && (
                        <span
                            className={cx(
                                "px-0.5 text-sm font-medium tracking-[0.02em] text-[#111827] transition duration-200 ease-linear",
                                current && "text-[#111827]",
                            )}
                        >
                            {children}
                        </span>
                    )}
                </a>
            </Pressable>
        </Tooltip>
    );
};
