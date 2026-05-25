import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import type { AdminClientCompaniesResponse } from "@/types/system-admin-client";

const parseBackendError = (error: unknown) => {
  const fallback = {
    status: 500,
    body: {
      message: "Erro interno ao buscar empresas do cliente.",
      error: error instanceof Error ? error.message : String(error),
    },
  };

  if (!(error instanceof Error)) return fallback;

  const match = error.message.match(
    /^Erro ao acessar backend \((\d+)\):\s*(.*)$/,
  );
  if (!match) return fallback;

  const status = Number(match[1]);
  const payloadText = match[2]?.trim();

  if (!payloadText) {
    return {
      status: Number.isFinite(status) ? status : 500,
      body: { message: "Erro ao buscar empresas do cliente." },
    };
  }

  try {
    return {
      status: Number.isFinite(status) ? status : 500,
      body: JSON.parse(payloadText),
    };
  } catch {
    return {
      status: Number.isFinite(status) ? status : 500,
      body: { message: payloadText },
    };
  }
};

export const GET = auth(async function GET(req, context) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    if (authData.user?.type !== "system_admin") {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const params = await context?.params;
    const id = params?.id as string;
    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente é obrigatório" },
        { status: 400 },
      );
    }

    const data = await fetchFromBackend<AdminClientCompaniesResponse>(
      req,
      `/system-admin/clients/${id}/companies`,
      authData.token!,
      {
        method: "GET",
        skipCompanyContext: true,
      },
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const parsed = parseBackendError(error);
    return NextResponse.json(parsed.body, { status: parsed.status });
  }
});
