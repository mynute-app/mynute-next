export type Design = {
  design?: {
    colors?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
      quaternary?: string;
    };
    images?: {
      background?: {
        alt?: string;
        title?: string;
        caption?: string;
        url?: string;
      };
      banner?: { alt?: string; title?: string; caption?: string; url?: string };
      favicon?: {
        alt?: string;
        title?: string;
        caption?: string;
        url?: string;
      };
      logo?: { alt?: string; title?: string; caption?: string; url?: string };
      profile?: {
        alt?: string;
        title?: string;
        caption?: string;
        url?: string;
      };
    };
  };
};

export type Branch = {
  id: string | number;
  company_id?: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  time_zone?: string;
  total_service_density?: number;
  services_count?: number;
  employees_count?: number;
  work_schedule_summary?: string;
  is_active?: boolean;
  active?: boolean;
  image?: string;
  services?: number[];
  employees?: Employee[];
  work_schedule?: any[];
} & Design;

export type BranchListResponse = {
  branches: Branch[];
  total: number;
  page: number;
  page_size: number;
};

export type Service = {
  id: any;
  name: string;
  duration: string | number;
  buffer?: string;
  price?: any;
  description: string;
  location?: string;
  category?: string;
  hidden?: boolean;
  is_active?: boolean;
  show_image?: boolean;
} & Design;

export type ServiceListResponse = {
  services: Service[];
  total: number;
  page: number;
  page_size: number;
};

export type Employee = {
  work_schedule: any;
  id: number | string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  permission: string;
  role: string;
  description?: string;
  is_active?: boolean;
  services_count?: number;
  appointments_count?: number;
  has_schedule?: boolean;
  schedule_label?: string;
  branches: Branch[];
  services: Service[];
  meta?: {
    design?: Design["design"];
  };
};

export type EmployeeListResponse = {
  employees: Employee[];
  total: number;
  page: number;
  page_size: number;
};

export interface Company {
  id: string;
  legal_name: string;
  trading_name: string;
  name?: string;
  tax_id: string;
  branches: Branch[];
  services: Service[];
  employees: Employee[];
  sectors: any[];
  subdomains: any[];
  design?: Design["design"];
}
