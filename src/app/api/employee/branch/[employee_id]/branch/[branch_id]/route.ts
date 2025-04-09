import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";

export const POST = auth(async function POST(req, ctx) {
  try {
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, branch_id } = ctx.params as {
      employee_id: string;
      branch_id: string;
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/${employee_id}/branch/${branch_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("❌ Erro na API do backend:", responseData);
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

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
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, branch_id } = ctx.params as {
      employee_id: string;
      branch_id: string;
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/${employee_id}/branch/${branch_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("❌ Erro na API do backend:", responseData);
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar a requisição:", error);
    return NextResponse.json(
      { message: "Erro interno ao desvincular a filial do funcionário" },
      { status: 500 }
    );
  }
});
