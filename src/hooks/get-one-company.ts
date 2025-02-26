import { useEffect, useState } from "react";

export const useGetCompany = (companyId: string | number) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/company/${companyId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar dados da empresa");
        }

        const data = await response.json();
        setCompany(data);
      } catch (error) {
        console.error("❌ Erro ao buscar dados da empresa:", error);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  return { company, loading };
};
