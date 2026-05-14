import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import type { AdminClientAppointmentsResponse } from "@/types/system-admin-client";

const parseBackendError = (error: unknown) => {
  const fallback = {
    status: 500,
    body: {
      message: "Erro interno ao buscar agendamentos do cliente.",
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
      body: { message: "Erro ao buscar agendamentos do cliente." },
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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { message: "ID do cliente inválido" },
        { status: 400 },
      );
    }

    const data = await fetchFromBackend<AdminClientAppointmentsResponse>(
      req,
      `/system-admin/clients/${id}/appointments`,
      authData.token!,
      {
        method: "GET",
        skipCompanyContext: true,
      },
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const { status, body } = parseBackendError(error);
    return NextResponse.json(body, { status });
  }
});
