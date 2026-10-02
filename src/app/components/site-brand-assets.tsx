"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/api";
import { SITE_LOGO_URL } from "@/lib/site-brand";

const BRAND_STORAGE_KEY = "iqra-site-brand-cache";

type CachedBrand = {
  logoUrl?: string;
};

const readCachedBrand = (): CachedBrand | null => {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(BRAND_STORAGE_KEY);
    return value ? (JSON.parse(value) as CachedBrand) : null;
  } catch {
    return null;
  }
};

const writeCachedBrand = (logoUrl?: string) => {
  if (typeof window === "undefined") return;
  const payload: CachedBrand = { logoUrl: logoUrl?.trim() || "" };
  if (!payload.logoUrl) {
    window.localStorage.removeItem(BRAND_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(payload));
};

export function SiteBrandAssets() {
  useEffect(() => {
    let active = true;

    const setIconLink = (rel: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-site-icon="true"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        el.dataset.siteIcon = "true";
        document.head.appendChild(el);
      }
      return el;
    };

    const applyIcon = (logoUrl?: string) => {
      const safeUrl = logoUrl?.trim();
      const icon = setIconLink("icon");
      const shortcut = setIconLink("shortcut icon");

      if (!safeUrl) {
        icon.remove();
        shortcut.remove();
        writeCachedBrand();
        return;
      }

      const extension = safeUrl.split(/[?#]/)[0]?.split(".").pop()?.toLowerCase();
      icon.href = safeUrl;
      shortcut.href = safeUrl;
      icon.type = extension === "svg" ? "image/svg+xml" : extension === "png" ? "image/png" : "image/webp";
      shortcut.type = icon.type;
      writeCachedBrand(safeUrl);
    };

    const updateIcon = async () => {
      const cached = readCachedBrand();
      if (!SITE_LOGO_URL && cached?.logoUrl && active) {
        applyIcon(cached.logoUrl);
      }

      try {
        const settings = await getSettings();
        const logoUrl = SITE_LOGO_URL || settings.logo_url?.trim();
        if (!active) return;
        applyIcon(logoUrl);
      } catch {
        if (active) {
          const cachedAgain = readCachedBrand();
          if (cachedAgain?.logoUrl) applyIcon(cachedAgain.logoUrl);
        }
      }
    };

    void updateIcon();
    window.addEventListener("iqra-settings-updated", updateIcon);
    return () => {
      active = false;
      window.removeEventListener("iqra-settings-updated", updateIcon);
    };
  }, []);

  return null;
}