import { CompanyNotFound } from "@/components/custom/company-not-found";
import { InvalidSubdomain } from "@/components/custom/invalid-subdomain";
import { CompanyBookingPage } from "@/components/public/company-booking-page";
import { getPublicCompanyByTenantSlug } from "@/lib/tenant-public-company";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const result = await getPublicCompanyByTenantSlug(tenant);

  if (!result.success) {
    if (result.error === "invalid_tenant") {
      return <InvalidSubdomain />;
    }
    return <CompanyNotFound subdomain={tenant} />;
  }

  return <CompanyBookingPage company={result.company} />;
}
