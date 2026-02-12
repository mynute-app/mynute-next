import type { Company } from "@/lib/subdomain-validation";
import { normalizeTenantSlug } from "@/lib/tenant";

type TenantPublicCompanySuccess = {
  success: true;
  tenant: string;
  company: Company;
};

type TenantPublicCompanyError = {
  success: false;
  tenant: string | null;
  error: "invalid_tenant" | "company_not_found";
};

export type TenantPublicCompanyLookupResult =
  | TenantPublicCompanySuccess
  | TenantPublicCompanyError;

const hasCompanyContent = (company: Company | null | undefined) => {
  if (!company) return false;

  return Boolean(
    (Array.isArray(company.services) && company.services.length > 0) ||
      (Array.isArray(company.employees) && company.employees.length > 0) ||
      (Array.isArray(company.branches) && company.branches.length > 0),
  );
};

async function fetchCompanyByNameCandidate(name: string) {
  const response = await fetch(
    `${process.env.BACKEND_URL}/company/name/${encodeURIComponent(name)}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as Company;
}

export async function getPublicCompanyByTenantSlug(
  tenantInput: string | null | undefined,
): Promise<TenantPublicCompanyLookupResult> {
  const tenant = normalizeTenantSlug(tenantInput);

  if (!tenant) {
    return {
      success: false,
      tenant: null,
      error: "invalid_tenant",
    };
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/company/subdomain/${encodeURIComponent(tenant)}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return {
        success: false,
        tenant,
        error: "company_not_found",
      };
    }

    const company = (await response.json()) as Company;

    if (hasCompanyContent(company)) {
      return {
        success: true,
        tenant,
        company,
      };
    }

    const candidates = Array.from(
      new Set(
        [
          tenant,
          tenant.replace(/-/g, " "),
          company.legal_name,
          company.trading_name,
        ]
          .map(value => value?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );

    for (const candidate of candidates) {
      const fullCompany = await fetchCompanyByNameCandidate(candidate);
      if (fullCompany && hasCompanyContent(fullCompany)) {
        return {
          success: true,
          tenant,
          company: fullCompany,
        };
      }
    }

    return {
      success: true,
      tenant,
      company,
    };
  } catch {
    return {
      success: false,
      tenant,
      error: "company_not_found",
    };
  }
}
