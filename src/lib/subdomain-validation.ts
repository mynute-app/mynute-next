import { headers } from "next/headers";

export interface Company {
  id: string;
  legal_name: string;
  trading_name?: string;
  design?: {
    images?: {
      banner_url?: string;
    };
  };
  // Adicione outras propriedades conforme necessário
}

export interface SubdomainValidationResult {
  success: true;
  company: Company;
  subdomain: string;
}

export interface SubdomainValidationError {
  success: false;
  error: "invalid_subdomain" | "company_not_found";
  subdomain?: string;
}

export type SubdomainValidationResponse =
  | SubdomainValidationResult
  | SubdomainValidationError;

/**
 * Valida o subdomínio e busca os dados da empresa
 * @returns Objeto com os dados da empresa ou erro
 */
export async function validateSubdomainAndGetCompany(): Promise<SubdomainValidationResponse> {
  const host = headers().get("host") || "";
  const subdomain = host.split(".")[0];

  // Validação do subdomínio
  if (!subdomain || subdomain === "localhost" || subdomain === "127") {
    return {
      success: false,
      error: "invalid_subdomain",
    };
  }

  // Buscar empresa pelo subdomínio
  const apiUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${apiUrl}/api/company/subdomain/${subdomain}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        error: "company_not_found",
        subdomain,
      };
    }

    const company = await res.json();

    return {
      success: true,
      company,
      subdomain,
    };
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return {
      success: false,
      error: "company_not_found",
      subdomain,
    };
  }
}
