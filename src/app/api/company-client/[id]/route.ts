import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const GET = auth(async function GET(req, { params }) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const clientId = resolvedParams?.id;

    if (!clientId) {
      return NextResponse.json(
        { message: "ID do cliente não informado." },
        { status: 400 }
      );
    }

    const client = await fetchFromBackend(
      req,
      `/company-client/${clientId}`,
      authData.token!,
      {
        method: "GET",
      }
    );

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar cliente:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao buscar cliente.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, { params }) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const clientId = resolvedParams?.id;

    if (!clientId) {
      return NextResponse.json(
        { message: "ID do cliente não informado." },
        { status: 400 }
      );
    }

    await fetchFromBackend(req, `/company-client/${clientId}`, authData.token!, {
      method: "DELETE",
    });

    return NextResponse.json(
      { message: "Cliente deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao deletar cliente:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao deletar cliente.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
