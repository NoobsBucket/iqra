"use client";

import { useEffect, useState } from "react";
import { UntitledLogo } from "@/app/components/foundations/logo/untitledui-logo";

export function SiteLogo({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return <UntitledLogo aria-hidden="true" className={className} />;

  return <img src={src} alt={alt} className={`block object-contain ${className}`} onError={() => setFailed(true)} />;
}