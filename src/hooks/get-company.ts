import { useEffect, useState } from "react";

export const useCompany = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/company`);
        const data = await response.json();

        console.log("🔍 Debug useCompany - API Response:", data);

        setCompany(data);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        setCompany({});
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  return { company, loading };
};
