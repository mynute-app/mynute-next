import type { Company } from "@/lib/subdomain-validation";
import { normalizeTenantSlug } from "@/lib/tenant";

type TenantCompanySuccess = {
  success: true;
  tenant: string;
  company: Company;
};

type TenantCompanyError = {
  success: false;
  tenant: string | null;
  error: "invalid_tenant" | "company_not_found";
};

export type TenantCompanyLookupResult = TenantCompanySuccess | TenantCompanyError;

export async function getCompanyByTenantSlug(
  tenantInput: string | null | undefined,
): Promise<TenantCompanyLookupResult> {
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
