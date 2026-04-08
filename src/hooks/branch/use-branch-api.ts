import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchWithCache } from "@/lib/cache/client-request-cache";
import { Branch, BranchListResponse } from "../../../types/company";

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

const normalizeBranch = (branchData: Branch): Branch => ({
  ...branchData,
  is_active:
    typeof branchData.is_active === "boolean"
      ? branchData.is_active
      : typeof branchData.active === "boolean"
        ? branchData.active
        : undefined,
  active:
    typeof branchData.active === "boolean"
      ? branchData.active
      : typeof branchData.is_active === "boolean"
        ? branchData.is_active
        : undefined,
  services: Array.isArray(branchData.services)
    ? branchData.services.map((service: any) =>
        typeof service === "number" ? service : service.id,
      )
    : branchData.services,
  employees: Array.isArray(branchData.employees)
    ? branchData.employees
    : branchData.employees,
});

export function useBranchApi() {
  const fetchBranches = useCallback(
    async (
      page = 1,
      pageSize = 10,
      force = false,
    ): Promise<BranchListResponse | null> => {
      try {
        const cacheKey = `branches:${page}:${pageSize}`;
        const branchList = await fetchWithCache(
          cacheKey,
          async () => {
            const queryParams = new URLSearchParams({
              page: page.toString(),
              page_size: pageSize.toString(),
            });

            const res = await fetch(`/api/branch?${queryParams.toString()}`);

            if (!res.ok) {
              const message = await parseErrorMessage(
                res,
                "Erro ao buscar filiais",
              );
              throw new Error(message);
            }

            return res.json();
          },
          { ttlMs: 30 * 1000, force },
        );

        return {
          ...branchList,
          branches: Array.isArray(branchList.branches)
            ? branchList.branches.map((branch: Branch) =>
                normalizeBranch(branch),
              )
            : [],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao buscar filiais";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return null;
      }
    },
    [],
  );

  /**
   * Busca uma filial por ID
   */
  const fetchBranchById = useCallback(
    async (id: number | string, force = false): Promise<Branch | null> => {
      try {
        const cacheKey = `branch:${id}`;
        const branchData = await fetchWithCache(
          cacheKey,
          async () => {
            const res = await fetch(`/api/branch/${id}`);

            if (!res.ok) {
              const message = await parseErrorMessage(
                res,
                "Erro ao buscar filial por ID",
              );
              throw new Error(message);
            }

            return res.json();
          },
          { ttlMs: 30 * 1000, force },
        );

        return normalizeBranch(branchData as Branch);
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
    [],
  );

  /**
   * Vincula um servico a filial
   */
  const linkService = useCallback(
    async (
      branchId: number | string,
      serviceId: number | string,
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/branch/${branchId}/service/${serviceId}`,
          {
            method: "POST",
          },
        );

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao vincular o servico",
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
          error instanceof Error ? error.message : "Erro ao vincular o servico";
        console.error("Erro ao vincular servico:", error);
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    },
    [],
  );

  /**
   * Desvincula um servico da filial
   */
  const unlinkService = useCallback(
    async (
      branchId: number | string,
      serviceId: number | string,
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/branch/${branchId}/service/${serviceId}`,
          {
            method: "DELETE",
          },
        );

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao desvincular o servico",
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
    [],
  );

  /**
   * Vincula um profissional a filial
   */
  const linkEmployeeToBranch = useCallback(
    async (
      employeeId: number | string,
      branchId: number | string,
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/employee/branch/${employeeId}/branch/${branchId}`,
          {
            method: "POST",
          },
        );

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao vincular o profissional",
          );
          throw new Error(message);
        }

        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao vincular o profissional";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    },
    [],
  );

  /**
   * Desvincula um profissional da filial
   */
  const unlinkEmployeeFromBranch = useCallback(
    async (
      employeeId: number | string,
      branchId: number | string,
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          `/api/employee/branch/${employeeId}/branch/${branchId}`,
          {
            method: "DELETE",
          },
        );

        if (!res.ok) {
          const message = await parseErrorMessage(
            res,
            "Erro ao desvincular o profissional",
          );
          throw new Error(message);
        }

        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao desvincular o profissional";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    },
    [],
  );

  return {
    fetchBranches,
    fetchBranchById,
    linkService,
    unlinkService,
    linkEmployeeToBranch,
    unlinkEmployeeFromBranch,
  };
}
