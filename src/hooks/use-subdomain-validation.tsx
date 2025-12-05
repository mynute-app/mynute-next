import {
  validateSubdomainAndGetCompany,
  Company,
} from "@/lib/subdomain-validation";
import { CompanyNotFound } from "@/components/custom/company-not-found";
import { InvalidSubdomain } from "@/components/custom/invalid-subdomain";

export interface SubdomainHookResult {
  company: Company | null;
  subdomain: string | null;
  errorComponent: React.ReactElement | null;
  isMainDomain: boolean;
}

/**
 * Hook para usar a validação de subdomínio em Server Components
 * Retorna os dados da empresa ou o componente de erro para renderizar
 */
export async function useSubdomainValidation(): Promise<SubdomainHookResult> {
  const result = await validateSubdomainAndGetCompany();

  // Se for o domínio principal (mynute.app ou localhost sem subdomínio)
  if (result.isMainDomain) {
    return {
      company: null,
      subdomain: null,
      errorComponent: null,
      isMainDomain: true,
    };
  }

  if (!result.success) {
    let errorComponent: React.ReactElement;

    if (result.error === "invalid_subdomain") {
      errorComponent = <InvalidSubdomain />;
    } else {
      errorComponent = <CompanyNotFound subdomain={result.subdomain!} />;
    }

    return {
      company: null,
      subdomain: result.subdomain || null,
      errorComponent,
      isMainDomain: false,
    };
  }

  return {
    company: result.company,
    subdomain: result.subdomain,
    errorComponent: null,
    isMainDomain: false,
  };
}
