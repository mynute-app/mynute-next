import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type CompanyColors = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
};

export const useCompanyColors = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateCompanyColors = async (
    companyId: string,
    colors: CompanyColors
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/company/${companyId}/design/colors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao atualizar cores");
      }

      const data = await response.json();
      toast({
        title: "Cores atualizadas",
        description: "As cores da marca foram salvas com sucesso.",
      });
      return data;
    } catch (error) {
      toast({
        title: "Erro ao salvar cores",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar as cores.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateCompanyColors, loading };
};
