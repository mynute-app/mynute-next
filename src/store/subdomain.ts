import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubdomainState {
  companyId: string | null;
  setCompanyId: (id: string) => void;
}

export const useSubdomainStore = create<SubdomainState>()(
  persist(
    set => ({
      companyId: null,
      setCompanyId: (id: string) => set({ companyId: id }),
    }),
    {
      name: "subdomain-storage",
    }
  )
);
