type BackendErrorResponse = {
  description_br: string;
  description_en?: string;
  http_status: number;
  inner_error?: any;
};

export async function handleBackendResponse<T = any>(
  response: Response
): Promise<T> {
  const json = await response.json();

  if (
    json &&
    typeof json === "object" &&
    "http_status" in json &&
    json.http_status >= 400
  ) {
    const typed = json as BackendErrorResponse;
    const errorMessage =
      typed.description_br || typed.description_en || "Erro no backend";
    const status = typed.http_status;

    const error = new Error(errorMessage);
    (error as any).status = status;
    (error as any).raw = json;

    throw error;
  }

  return json;
}
