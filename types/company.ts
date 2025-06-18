import { serviceSchema } from "./../validations/validation";
export type Branch = {
  id: number;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
};

export type Service = {
  id: any;
  name: string;
  duration: string;
  buffer?: string;
  price?: any;
  description: string;
  location?: string;
  category?: string;
  hidden?: boolean;
};

export type Employee = {
  work_schedule: any;
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  permission: string;
  role: string;
  branches: Branch[];
  services: Service[];
};
export interface Company {
  id: string; 
  legal_name: string; 
  trading_name: string; 
  name?: string;
  tax_id: string;
  design?: {
    colors?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
      quaternary?: string;
    };
    images?: {
      logo?: { url?: string };
      banner?: { url?: string };
      background?: { url?: string };
    };
  };
  branches: Branch[];
  services: Service[];
  employees: Employee[];
  sectors: any[]; // Baseado no seu log
  subdomains: any[]; // Baseado no seu log
}
