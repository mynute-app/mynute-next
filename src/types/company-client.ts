export interface CompanyClient {
  id: string;
  company_id?: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyClientInput {
  name: string;
  surname: string;
  email: string;
  phone: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface CompanyClientListResponse {
  company_clients: CompanyClient[];
  page: number;
  page_size: number;
  total: number;
}
