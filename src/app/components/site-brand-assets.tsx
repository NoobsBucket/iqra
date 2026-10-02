"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/api";

export function SiteBrandAssets() {
  useEffect(() => {
    let active = true;

    const updateIcon = async () => {
      const settings = await getSettings();
      const logoUrl = settings.logo_url?.trim();

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

      const updateIconLink = (rel: string) => {
        const link = setIconLink(rel);
        if (!logoUrl) {
          link.remove();
          return;
        }
        link.href = logoUrl;
        const extension = logoUrl.split(/[?#]/)[0]?.split(".").pop()?.toLowerCase();
        link.type = extension === "svg" ? "image/svg+xml" : extension === "png" ? "image/png" : "image/webp";
      };

      if (!active) return;
      updateIconLink("icon");
      updateIconLink("shortcut icon");
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