// lib/get-company-from-request.ts
import { NextRequest } from "next/server";
import { getCachedCompany, setCachedCompany } from "@/lib/cache/company-cache";

export async function getCompanyFromRequest(req: NextRequest) {
  const rawHost = req.headers.get("host") || "";
  // Remove porta se existir (ex: agenda-kaki.127.0.0.1.nip.io:3000 -> agenda-kaki.127.0.0.1.nip.io)
  const host = rawHost.split(":")[0];
  const subdomain = host.split(".")[0];

  if (!subdomain) {
    throw new Error("Subdomínio não identificado.");
  }

  const cached = getCachedCompany(subdomain);
  if (cached) {
    return cached;
  }

  // Preferir a origem da requisição atual para evitar inconsistência entre hosts (localhost vs nip.io)
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

  const minimal = {
    id: company.id,
    schema_name: company.schema_name ?? undefined,
  };

  setCachedCompany(subdomain, minimal);

  return minimal;
}
