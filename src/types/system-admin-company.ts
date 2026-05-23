export interface AdminCompanySector {
  id: string;
  name: string;
  description: string;
}

export interface AdminCompanySubdomain {
  id: string;
  name: string;
  company_id: string;
}

export interface AdminCompanyBranch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  is_active?: boolean;
}

export interface AdminCompanyEmployee {
  id: string | number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role?: string;
  permission?: string;
  is_active?: boolean;
  verified?: boolean;
}

export interface AdminCompanyService {
  id: string;
  name: string;
  price?: number;
  duration?: number;
  is_active?: boolean;
  description?: string;
}

export interface AdminCompany {
  id: string;
  legal_name: string;
  trading_name: string;
  tax_id: string;
  schema_name?: string;
  design?: {
    colors?: Record<string, string>;
    images?: Record<string, { url?: string }>;
  };
  sectors: AdminCompanySector[];
  subdomains: AdminCompanySubdomain[];
  branches?: AdminCompanyBranch[];
  employees?: AdminCompanyEmployee[];
  services?: AdminCompanyService[];
}

export interface AdminCompaniesListResponse {
  companies: AdminCompany[];
  total: number;
  page: number;
  page_size: number;
}
