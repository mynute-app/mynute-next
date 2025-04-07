import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

export const POST = auth(async function POST(req, ctx) {
  try {
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, service_id } = ctx.params as {
      employee_id: string;
      service_id: string;
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/${employee_id}/service/${service_id}`,
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
      { message: "Erro interno ao vincular o serviço ao funcionário" },
      { status: 500 }
    );
  }
});
