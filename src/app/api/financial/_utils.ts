import { NextResponse } from "next/server";
import { BackendHttpError, BackendUnauthorizedError } from "@/lib/api/fetch-from-backend";

export function getQueryParams(req: Request) {
  const queryParams: Record<string, string> = {};
  const { searchParams } = new URL(req.url);
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  return queryParams;
}

export function unauthorized(message = "Token inválido") {
  return NextResponse.json({ message }, { status: 401 });
}

export function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof BackendUnauthorizedError) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  if (error instanceof BackendHttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { message: error instanceof Error ? error.message : fallbackMessage },
    { status: 500 },
  );
}
