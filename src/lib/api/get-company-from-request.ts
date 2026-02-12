import { NextRequest } from "next/server";
import { getCachedCompany, setCachedCompany } from "@/lib/cache/company-cache";
import {
  normalizeTenantSlug,
  resolveTenantSlugFromRequest,
} from "@/lib/tenant";

export async function getCompanyFromRequest(req: NextRequest) {
  const rawHost = req.headers.get("host") || "";
  const host = rawHost.split(":")[0];

  const authTenant = normalizeTenantSlug(
    (req as any)?.auth?.tenant ?? (req as any)?.auth?.subdomain ?? null,
  );
  const tenant = authTenant ?? resolveTenantSlugFromRequest(req);

  if (!tenant) {
    throw new Error("Tenant nao identificado.");
  }

  const cached = getCachedCompany(tenant);
  if (cached) {
    const patched = {
      ...cached,
      schema_name: cached.schema_name || tenant,
    };
    setCachedCompany(tenant, patched);
    return patched;
  }

  const baseUrl =
    req.nextUrl?.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const bySubdomainUrl = `${baseUrl}/api/company/subdomain/${tenant}`;
  const subdomainRes = await fetch(bySubdomainUrl, {
    cache: "no-store",
  });

  let company: any;

  if (subdomainRes.ok) {
    company = await subdomainRes.json();
  } else {
    const byNameUrl = `${baseUrl}/api/company/name/${encodeURIComponent(tenant)}`;
    const nameRes = await fetch(byNameUrl, {
      cache: "no-store",
    });

    if (!nameRes.ok) {
      let details: string | undefined;
      try {
        details = await nameRes.text();
      } catch {}

      throw new Error(
        `Empresa nao encontrada para esse tenant. host=${host} tenant=${tenant} url=${bySubdomainUrl} fallback=${byNameUrl} status=${nameRes.status}${details ? ` body=${details}` : ""}`,
      );
    }

    company = await nameRes.json();
  }

  const schemaFromApi =
    typeof company.schema_name === "string" && company.schema_name.trim()
      ? company.schema_name
      : undefined;

  const minimal = {
    id: company.id,
    schema_name: schemaFromApi ?? tenant,
  };

  setCachedCompany(tenant, minimal);

  return minimal;
}
