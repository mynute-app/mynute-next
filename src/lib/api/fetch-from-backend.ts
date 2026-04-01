import { NextRequest } from "next/server";
import { getCompanyFromRequest } from "./get-company-from-request";

export class BackendUnauthorizedError extends Error {
  constructor(message = "Token de autorização inválido ou expirado") {
    super(message);
    this.name = "BackendUnauthorizedError";
  }
}

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
  options: Options = {},
): Promise<T> {
  const useCompanyContext = options.skipCompanyContext !== true;
  const company = useCompanyContext
    ? await getCompanyFromRequest(req)
    : undefined;
  const maxRetries = 1;
  const method = options.method || "GET";

  const queryString = options.queryParams
    ? "?" +
      Object.entries(options.queryParams)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join("&")
    : "";

  const url = `${process.env.BACKEND_URL}${endpoint}${queryString}`;

  let response: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      response = await fetch(url, {
        method,
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
        networkError,
      );
      throw networkError;
    }

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return response.json();
      }

      // Se não houver JSON, retorna vazio (ou undefined)
      return {} as T;
    }

    const errorText = await response.text();
    const shouldRetry =
      method === "GET" &&
      (errorText.includes("SQLSTATE 42P01") ||
        errorText.includes("SQLSTATE 42703"));

    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[fetchFromBackend] Backend error ${
          response.status
        } on ${url} | companyId=${company?.id ?? "-"} schema=${
          company?.schema_name ?? "-"
        } | body=${errorText}`,
      );
    }

    if (response.status === 401) {
      throw new BackendUnauthorizedError();
    }

    if (shouldRetry && attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 150));
      continue;
    }

    throw new Error(
      `Erro ao acessar backend (${response.status}): ${errorText}`,
    );
  }

  throw new Error("Erro ao acessar backend.");
}
