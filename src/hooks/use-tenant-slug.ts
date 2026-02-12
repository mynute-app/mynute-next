"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  extractTenantSlugFromHost,
  extractTenantSlugFromPathname,
  normalizeTenantSlug,
} from "@/lib/tenant";

export function useTenantSlug() {
  const pathname = usePathname();

  return useMemo(() => {
    const tenantFromPath = extractTenantSlugFromPathname(pathname);
    if (tenantFromPath) {
      return tenantFromPath;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const tenantFromHost = extractTenantSlugFromHost(window.location.host);
    if (tenantFromHost) {
      return tenantFromHost;
    }

    const params = new URLSearchParams(window.location.search);
    return normalizeTenantSlug(params.get("tenant") || params.get("companyId"));
  }, [pathname]);
}
