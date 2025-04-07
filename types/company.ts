export interface Branch {
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
}

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
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  permission: string;
  role: string;
};
export interface Company {
  id: number;
  name: string;
  tax_id: string;
  branches: Branch[];
  services: Service[];
  employees: Employee[];
}
