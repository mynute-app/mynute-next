import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;
    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, service_id } = ctx.params as {
      branch_id: string;
      service_id: string;
    };

    // Usando fetchFromBackend para vincular serviço à filial
    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/service/${service_id}`,
      token,
      {
        method: "POST",
      }
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro interno:", error);
    return NextResponse.json(
      { message: "Erro interno ao vincular o serviço à filial" },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, service_id } = ctx.params as {
      branch_id: string;
      service_id: string;
    };

    // Usando fetchFromBackend para desvincular serviço da filial
    await fetchFromBackend(
      req,
      `/branch/${branch_id}/service/${service_id}`,
      token,
      {
        method: "DELETE",
      }
    );
    return NextResponse.json(
      { message: "Serviço desvinculado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro interno:", error);
    return NextResponse.json(
      { message: "Erro interno ao desvincular o serviço da filial" },
      { status: 500 }
    );
  }
});
