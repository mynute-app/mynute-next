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

export interface Company {
  id: number;
  name: string;
  tax_id: string;
  branches: Branch[];
}
