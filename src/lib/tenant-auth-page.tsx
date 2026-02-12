import { CompanyNotFound } from "@/components/custom/company-not-found";
import { InvalidSubdomain } from "@/components/custom/invalid-subdomain";
import { getCompanyByTenantSlug } from "@/lib/tenant-company";

export async function getTenantCompanyForAuthPage(tenantInput: string) {
  const result = await getCompanyByTenantSlug(tenantInput);

  if (!result.success) {
    return {
      company: null,
      errorComponent:
        result.error === "invalid_tenant" ? (
          <InvalidSubdomain />
        ) : (
          <CompanyNotFound subdomain={tenantInput} />
        ),
    };
  }

  return {
    company: result.company,
    errorComponent: null,
  };
}
