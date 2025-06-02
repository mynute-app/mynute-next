// hooks/useLoadCompany.ts
import { useEffect } from "react";
import { useCompanyStore } from "@/store/company";

export function useLoadCompany() {
  const { company, setCompany } = useCompanyStore();

  useEffect(() => {
    if (company) return;

    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        if (!res.ok) throw new Error("Erro ao buscar empresa");
        const data = await res.json();
        setCompany(data);
      } catch (err) {
        console.error("❌ Erro ao carregar empresa:", err);
      }
    };

    fetchCompany();
  }, [company, setCompany]);
}
