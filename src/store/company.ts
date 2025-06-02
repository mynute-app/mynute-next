// store/company.ts
import { create } from "zustand";

// types/company.ts
export interface Company {
  id: string;
  legal_name: string;
  trading_name: string;
  tax_id: string;
  employees: any[];
  branches: any[];
  services: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
  }[];
  sectors: any[];
  subdomains: {
    id: string;
    name: string;
    company_id: string;
  }[];
  design: {
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
    };
    images: {
      logo_url: string;
      banner_url: string;
      background_url: string;
      favicon_url: string;
    };
  };
}

type State = {
  company: Company | null;
  setCompany: (company: Company) => void;
};

export const useCompanyStore = create<State>(set => ({
  company: null,
  setCompany: company => set({ company }),
}));
