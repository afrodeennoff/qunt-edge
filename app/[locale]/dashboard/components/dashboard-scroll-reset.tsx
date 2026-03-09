"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function DashboardScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, activeTab]);

  return null;
}
