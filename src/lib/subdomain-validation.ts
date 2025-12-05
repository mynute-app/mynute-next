import { headers } from "next/headers";

export interface Company {
  id: string;
  legal_name: string;
  trading_name?: string;
  tax_id?: string;
  design?: {
    images?: CompanyImages;
    colors?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
      quaternary?: string;
    };
  };
  subdomains?: {
    id: string;
    name: string;
    company_id: string;
  }[];
  employees?: {
    id: string;
    company_id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
  }[];
  branches?: any[]; // Tipar se necessário
  services?: any[]; // Tipar se necessário
}

// Subtipos
export interface CompanyImage {
  alt?: string;
  title?: string;
  caption?: string;
  url?: string;
}

export interface CompanyImages {
  logo?: CompanyImage;
  banner?: CompanyImage;
  background?: CompanyImage;
  favicon?: CompanyImage;
}

export interface SubdomainValidationResult {
  success: true;
  company: Company;
  subdomain: string;
  isMainDomain: false;
}

export interface SubdomainValidationError {
  success: false;
  error: "invalid_subdomain" | "company_not_found";
  subdomain?: string;
  isMainDomain: false;
}

export interface MainDomainResult {
  success: true;
  isMainDomain: true;
  company: null;
  subdomain: null;
}

export type SubdomainValidationResponse =
  | SubdomainValidationResult
  | SubdomainValidationError
  | MainDomainResult;

/**
 * Verifica se o host é o domínio principal da aplicação
 * Domínios principais: localhost, mynute.app, www.mynute.app
 */
function isMainDomain(host: string): boolean {
  const mainDomains = [
    "localhost",
    "127.0.0.1",
    "mynute.app",
    "www.mynute.app",
  ];

  // Remove porta se existir
  const hostWithoutPort = host.split(":")[0];

  // Verifica se é exatamente um dos domínios principais
  if (mainDomains.includes(hostWithoutPort)) {
    return true;
  }

  // Verifica se é mynute.app ou www.mynute.app
  if (
    hostWithoutPort === "mynute.app" ||
    hostWithoutPort === "www.mynute.app"
  ) {
    return true;
  }

  return false;
}

/**
 * Valida o subdomínio e busca os dados da empresa
 * @returns Objeto com os dados da empresa ou erro
 */
export async function validateSubdomainAndGetCompany(): Promise<SubdomainValidationResponse> {
  const host = headers().get("host") || "";

  // Verifica se é o domínio principal
  if (isMainDomain(host)) {
    return {
      success: true,
      isMainDomain: true,
      company: null,
      subdomain: null,
    };
  }

  const subdomain = host.split(".")[0];

  // Validação do subdomínio
  if (!subdomain || subdomain === "127") {
    return {
      success: false,
      error: "invalid_subdomain",
      isMainDomain: false,
    };
  }

  // Buscar empresa pelo subdomínio usando a rota /api/company/name
  // que já faz todas as tentativas de variações de nome
  const apiUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${apiUrl}/api/company/name/${encodeURIComponent(subdomain)}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        success: false,
        error: "company_not_found",
        subdomain,
        isMainDomain: false,
      };
    }

    const company = await res.json();

    return {
      success: true,
      company,
      subdomain,
      isMainDomain: false,
    };
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return {
      success: false,
      error: "company_not_found",
      subdomain,
      isMainDomain: false,
    };
  }
}
