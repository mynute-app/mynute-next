import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, service_id } = ctx.params as {
      employee_id: string;
      service_id: string;
    };

    // Usando fetchFromBackend para vincular serviço ao funcionário
    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/service/${service_id}`,
      token,
      {
        method: "POST",
      }
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar a requisição:", error);
    return NextResponse.json(
      { message: "Erro interno ao vincular o serviço ao funcionário" },
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

    const { employee_id, service_id } = ctx.params as {
      employee_id: string;
      service_id: string;
    };

    // Usando fetchFromBackend para desvincular serviço do funcionário
    await fetchFromBackend(
      req,
      `/employee/${employee_id}/service/${service_id}`,
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
    console.error("❌ Erro ao processar o DELETE:", error);
    return NextResponse.json(
      { message: "Erro interno ao desvincular o serviço do funcionário" },
      { status: 500 }
    );
  }
});
