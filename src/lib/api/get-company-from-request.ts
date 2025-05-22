import { NextRequest } from "next/server";

export async function getCompanyFromRequest(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];

  if (!subdomain) {
    throw new Error("Subdomínio não identificado.");
  }

  const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;

  const res = await fetch(`${baseUrl}/api/company/subdomain/${subdomain}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Empresa não encontrada para esse subdomínio.");
  }

  const company = await res.json();
  return company;
}
