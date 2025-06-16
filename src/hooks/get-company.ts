import { useEffect, useState } from "react";

export const useCompany = (id?: string) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const endpoint = id ? `/api/company/${id}` : `/api/company`;
        console.log(`Fetching company data from: ${endpoint}`);

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch company: ${response.status}`);
        }

        const data = await response.json();

        if (
          !data ||
          (typeof data === "object" && Object.keys(data).length === 0)
        ) {
          throw new Error("Received empty company data");
        }

        console.log("Company data fetched successfully:", data);
        setCompany(data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        setError(error instanceof Error ? error : new Error(String(error)));

        // Only create an empty object if we've tried multiple times
        if (retries >= 2) {
          setCompany({});
        }

        // Increment retry counter for the next attempt
        setRetries(prev => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    if (error && retries < 3) {
      const retryTimer = setTimeout(() => {
        console.log(`Retrying company fetch (attempt ${retries + 1})...`);
        fetchCompanyData();
      }, 1000 * retries); // Increasing backoff delay

      return () => clearTimeout(retryTimer);
    } else {
      fetchCompanyData();
    }
  }, [id]);

  return { company, loading, error };
};
