"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MergeCompanySuppliersInput {
  keep_id: string;
  delete_id: string;
}

export function useMergeCompanySuppliers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const merge = useCallback(
    async (input: MergeCompanySuppliersInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/company-supplier/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erro ao mesclar fornecedores"
          );
        }

        toast({
          title: "Fornecedores mesclados",
          description: "Os fornecedores foram mesclados com sucesso.",
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast({
          title: "Erro ao mesclar fornecedores",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { merge, isLoading, error };
}
