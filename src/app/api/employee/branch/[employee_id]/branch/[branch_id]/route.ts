import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, branch_id } = ctx.params as {
      employee_id: string;
      branch_id: string;
    };

    // Usando fetchFromBackend para vincular filial ao funcionário
    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/branch/${branch_id}`,
      token,
      {
        method: "POST",
      }
    );

    // Não é necessário verificar response.ok, pois fetchFromBackend já trata erros
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar a requisição:", error);
    return NextResponse.json(
      { message: "Erro interno ao vincular a filial ao funcionário" },
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

    const { employee_id, branch_id } = ctx.params as {
      employee_id: string;
      branch_id: string;
    }; // Usando fetchFromBackend para desvincular filial do funcionário
    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/branch/${branch_id}`,
      token,
      {
        method: "DELETE",
      }
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar a requisição:", error);
    return NextResponse.json(
      { message: "Erro interno ao desvincular a filial do funcionário" },
      { status: 500 }
    );
  }
});
