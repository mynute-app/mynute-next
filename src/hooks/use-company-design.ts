import { useEffect, useState } from "react";

type Company = {
  id: string;
  legal_name: string;
  trading_name: string;
  tax_id: string;
  design?: any;
  subdomains?: any[];
};

export function useCompanyFromRequest() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const host = window.location.hostname;
    const subdomain = host.split(".")[0];

    if (!subdomain || host.includes("localhost")) {
      setLoading(false);
      setError("Subdomínio inválido ou ambiente local");
      return;
    }

    const url = `/api/company/subdomain/${subdomain}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar empresa");
        return res.json();
      })
      .then(data => {
        setCompany(data);
      })
      .catch(err => {
        console.error("Erro ao buscar empresa:", err);
        setError(err.message || "Erro inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  return { company, loading, error };
}
