// lib/get-company-from-request.ts
import { NextRequest } from "next/server";
import { getCachedCompany, setCachedCompany } from "@/lib/cache/company-cache";

export async function getCompanyFromRequest(req: NextRequest) {
  const rawHost = req.headers.get("host") || "";
  const host = rawHost.split(":")[0];
  const subdomain = host.split(".")[0];

  if (!subdomain) {
    throw new Error("Subdomínio não identificado.");
  }

  const cached = getCachedCompany(subdomain);
  if (cached) {
    if (cached.schema_name) {
      return cached;
    }

    const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    if (!isIpHost && subdomain && subdomain !== "localhost") {
      const patched = {
        ...cached,
        schema_name: subdomain,
      };
      setCachedCompany(subdomain, patched);
      return patched;
    }
  }

  const baseUrl =
    req.nextUrl?.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const target = `${baseUrl}/api/company/subdomain/${subdomain}`;
  const res = await fetch(target, {
    cache: "no-store",
  });

  if (!res.ok) {
    let details: string | undefined;
    try {
      details = await res.text();
    } catch (e) {}
    throw new Error(
      `Empresa não encontrada para esse subdomínio. host=${host} subdomain=${subdomain} url=${target} status=${
        res.status
      }${details ? ` body=${details}` : ""}`
    );
  }

  const company = await res.json();

  const schemaFromApi =
    typeof company.schema_name === "string" && company.schema_name.trim()
      ? company.schema_name
      : undefined;
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const schemaName =
    schemaFromApi ??
    (!isIpHost && subdomain && subdomain !== "localhost"
      ? subdomain
      : undefined);

  const minimal = {
    id: company.id,
    schema_name: schemaName,
  };

  setCachedCompany(subdomain, minimal);

  return minimal;
}
