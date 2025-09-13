import { NextRequest } from "next/server";
import { getCompanyFromRequest } from "./get-company-from-request";

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  queryParams?: Record<string, string | number | undefined>;
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  /**
   * When true, do NOT resolve company from subdomain and do NOT send tenant headers.
   * Use this for endpoints that are global (e.g., company creation, auth, healthchecks).
   * Defaults to false (i.e., include company context by default).
   */
  skipCompanyContext?: boolean;
};

/**
 * Faz requisição ao backend com token de auth e company contextado via subdomínio.
 */
export async function fetchFromBackend<T = any>(
  req: NextRequest,
  endpoint: string,
  authToken: string,
  options: Options = {}
): Promise<T> {
  const useCompanyContext = options.skipCompanyContext !== true;
  const company = useCompanyContext
    ? await getCompanyFromRequest(req)
    : undefined;

  const queryString = options.queryParams
    ? "?" +
      Object.entries(options.queryParams)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join("&")
    : "";

  const url = `${process.env.BACKEND_URL}${endpoint}${queryString}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { "X-Auth-Token": authToken } : {}),
        ...(useCompanyContext && company?.id
          ? { "X-Company-ID": company.id }
          : {}),
        ...(useCompanyContext && company?.schema_name
          ? { "X-Company-Schema": company.schema_name }
          : {}),
        ...(options.headers || {}),
      },
      cache: options.cache ?? "no-store",
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (networkError) {
    console.error(
      `[fetchFromBackend] Network error calling ${url} | companyId=${
        company?.id ?? "-"
      } schema=${company?.schema_name ?? "-"}:`,
      networkError
    );
    throw networkError;
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[fetchFromBackend] Backend error ${
          response.status
        } on ${url} | companyId=${company?.id ?? "-"} schema=${
          company?.schema_name ?? "-"
        } | body=${errorText}`
      );
    }
    throw new Error(
      `Erro ao acessar backend (${response.status}): ${errorText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  // Se não houver JSON, retorna vazio (ou undefined)
  return {} as T;
}
