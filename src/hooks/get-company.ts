import { useEffect, useState, useRef } from "react";
import { Company } from "../../types/company";

export const useGetCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCompanyData = async (retryCount = 0) => {
      try {
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Criar novo AbortController
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        const response = await fetch(`/api/company`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar empresa: ${response.status}`);
        }

        const data: Company = await response.json();
        console.log("🏢 Dados da empresa carregados:", data);
        setCompany(data);
        setError(null);
        setLoading(false); // Sucesso - terminar loading
      } catch (err) {
        // Ignorar erros de cancelamento
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Erro ao buscar dados da empresa:", err);

        // Retry logic para casos de erro temporário
        if (retryCount < 2) {
          console.log(
            `🔄 Tentando novamente... (tentativa ${retryCount + 1}/2)`
          );
          // Não parar o loading durante retry
          retryTimeoutRef.current = setTimeout(() => {
            fetchCompanyData(retryCount + 1);
          }, 1000 * (retryCount + 1)); // Backoff progressivo
          return;
        }

        // Só parar o loading quando esgotar todas as tentativas
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setCompany(null);
        setLoading(false);
      }
    };

    fetchCompanyData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return { company, loading, error };
};
