import { useEffect, useState } from "react";
import { useCompany } from "./get-company";
import { useSubdomain } from "./use-subdomain";

/**
 * Hook that provides company data with fallbacks and better error handling
 */
export function useCompanyWithFallback() {
  // Get company ID from subdomain
  const { companyId } = useSubdomain();

  // Use the updated useCompany hook with the companyId from subdomain
  const { company, loading, error } = useCompany(companyId || undefined);

  // Define fallback values
  const fallbackBannerUrl = "/banner.webp";
  const fallbackLogoUrl = "/logo-kaki.png";

  // Safely extract and provide company data with fallbacks
  const companyData = {
    id: company?.id || null,
    name: company?.legal_name || "Empresa",
    taxId: company?.tax_id || "",
    logoUrl: company?.design?.images?.logo_url || fallbackLogoUrl,
    bannerUrl: company?.design?.images?.banner_url || fallbackBannerUrl,
    primaryColor: company?.design?.colors?.primary || "#000000",
    secondaryColor: company?.design?.colors?.secondary || "#f5f5f5",
    darkMode: company?.design?.dark_mode || false,
    raw: company || null,
  };

  return {
    company: companyData,
    companyId,
    loading,
    error,
    hasData: !!company && Object.keys(company).length > 0,
  };
}
