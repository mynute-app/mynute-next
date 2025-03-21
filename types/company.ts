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
  id: string;
  name: string;
  duration: string;
  buffer?: string;
  price?: string;
  description: string;
  location?: string;
  category?: string;
  hidden?: boolean;
};

export interface Company {
  id: number;
  name: string;
  tax_id: string;
  branches: Branch[];
  services: Service[];
}
