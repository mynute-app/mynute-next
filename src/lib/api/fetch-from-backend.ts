import { NextRequest } from "next/server";
import { getCompanyFromRequest } from "./get-company-from-request";

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  queryParams?: Record<string, string | number | undefined>;
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
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
  const company = await getCompanyFromRequest(req);

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

  const response = await fetch(
    `${process.env.BACKEND_URL}${endpoint}${queryString}`,
    {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": authToken,
        "X-Company-ID": company.id,
        ...(company.schema_name && {
          "X-Company-Schema": company.schema_name,
        }),
        ...(options.headers || {}),
      },
      cache: options.cache ?? "no-store",
      body: options.body ? JSON.stringify(options.body) : undefined,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
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
