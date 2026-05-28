export interface CompanySupplier {
  id: string;
  company_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface CreateCompanySupplierInput {
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

export interface UpdateCompanySupplierInput {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface CompanySupplierListResponse {
  company_suppliers: CompanySupplier[];
  page: number;
  page_size: number;
  total: number;
}

export interface MergeCompanySuppliersInput {
  keep_id: string;
  delete_id: string;
}
