"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PlausibleRouter() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).plausible) {
      (window as any).plausible("pageview");
    }
  }, [pathname]);
  return null;
}
