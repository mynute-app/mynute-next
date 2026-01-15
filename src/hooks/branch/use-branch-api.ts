import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Branch } from "../../../types/company";

const parseErrorMessage = async (res: Response, fallback: string) => {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
  } catch {
    return text;
  }
  return fallback;
};

export function useBranchApi() {
  /**
   * Busca uma filial por ID
   */
  const fetchBranchById = useCallback(
    async (id: number | string): Promise<Branch | null> => {
      try {
        const res = await fetch(`/api/branch/${id}`);

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao buscar filial por ID"
          );
          throw new Error(message);
        }

        const branchData = await res.json();

        return {
          ...branchData,
          services: Array.isArray(branchData.services)
            ? branchData.services.map((s: any) =>
                typeof s === "number" ? s : s.id
              )
            : [],
          employees: branchData.employees ?? [],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao buscar filial por ID";
        console.error("Erro ao buscar filial:", error);
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return null;
      }
    },
    []
  );

  /**
   * Vincula um servico a filial
   */
  const linkService = useCallback(
    async (
      branchId: number | string,
      serviceId: number | string
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/branch/${branchId}/service/${serviceId}`,
          {
            method: "POST",
          }
        );

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao vincular o servico"
          );
          throw new Error(message);
        }

        toast({
          title: "Servico vinculado",
          description: "Servico vinculado a filial com sucesso.",
        });

        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao vincular o servico";
        console.error("Erro ao vincular servico:", error);
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    },
    []
  );

  /**
   * Desvincula um servico da filial
   */
  const unlinkService = useCallback(
    async (
      branchId: number | string,
      serviceId: number | string
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/branch/${branchId}/service/${serviceId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao desvincular o servico"
          );
          throw new Error(message);
        }

        toast({
          title: "Servico desvinculado",
          description: "Servico removido da filial com sucesso.",
          variant: "destructive",
        });

        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao desvincular o servico";
        console.error("Erro ao desvincular servico:", error);
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    },
    []
  );

  return {
    fetchBranchById,
    linkService,
    unlinkService,
  };
}
