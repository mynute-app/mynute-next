import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

const parseBackendError = (error: unknown) => {
  const fallback = {
    status: 500,
    body: {
      message: "Erro interno.",
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
  if (!payloadText)
    return {
      status: Number.isFinite(status) ? status : 500,
      body: { message: "Erro no servidor." },
    };
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
    if (!authData.isValid)
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );

    const { id } = await context.params;
    const data = await fetchFromBackend(
      req,
      `/support/tickets/${id}`,
      authData.token!,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const parsed = parseBackendError(error);
    return NextResponse.json(parsed.body, { status: parsed.status });
  }
});
