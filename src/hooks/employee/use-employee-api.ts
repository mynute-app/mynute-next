import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchWithCache } from "@/lib/cache/client-request-cache";
import type { Employee, EmployeeListResponse } from "../../../types/company";

const parseErrorPayload = async (res: Response) => {
  const text = await res.text();
  if (!text) return { message: "Erro ao buscar funcionarios" };

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
};

const getErrorMessage = (
  payload: Record<string, unknown>,
  fallback: string,
) => {
  if (typeof payload?.description_br === "string")
    return payload.description_br;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  return fallback;
};

const normalizeEmployee = (employee: Employee): Employee => {
  const role =
    (employee as any)?.role || (employee as any)?.permission || "Profissional";
  const permission =
    (employee as any)?.permission || (employee as any)?.role || "";

  return {
    ...employee,
    name: employee?.name || "",
    surname: employee?.surname || "",
    email: (employee as any)?.email || "",
    phone: (employee as any)?.phone || "",
    role,
    permission,
    branches: Array.isArray((employee as any)?.branches)
      ? (employee as any).branches
      : [],
    services: Array.isArray((employee as any)?.services)
      ? (employee as any).services
      : [],
    work_schedule: Array.isArray((employee as any)?.work_schedule)
      ? (employee as any).work_schedule
      : [],
  } as Employee;
};

export function useEmployeeApi() {
  const fetchEmployees = useCallback(
    async (
      page = 1,
      pageSize = 50,
      force = false,
    ): Promise<EmployeeListResponse | null> => {
      try {
        const cacheKey = `employees:${page}:${pageSize}`;

        const employeeList = await fetchWithCache(
          cacheKey,
          async () => {
            const queryParams = new URLSearchParams({
              page: String(page),
              page_size: String(pageSize),
            });

            const res = await fetch(`/api/employee?${queryParams.toString()}`);

            if (res.ok) {
              return res.json();
            }

            const payload = await parseErrorPayload(res);

            throw new Error(
              getErrorMessage(payload, "Erro ao buscar funcionarios"),
            );
          },
          { ttlMs: 30 * 1000, force },
        );

        return {
          ...employeeList,
          employees: Array.isArray(employeeList?.employees)
            ? (employeeList.employees as Employee[]).map(employee =>
                normalizeEmployee(employee),
              )
            : [],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao buscar funcionarios";

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

  return { fetchEmployees };
}
