import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

export const POST = auth(async function POST(req, ctx) {
  try {
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, service_id } = ctx.params as {
      branch_id: string;
      service_id: string;
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/branch/${branch_id}/service/${service_id}`,
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
      console.error("❌ Erro ao vincular serviço:", responseData);
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

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
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { branch_id, service_id } = ctx.params as {
    branch_id: string;
    service_id: string;
  };

  const backendResponse = await fetch(
    `${process.env.BACKEND_URL}/branch/${branch_id}/service/${service_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
    }
  );

  if (!backendResponse.ok) {
    const responseData = await backendResponse.json();
    return NextResponse.json(responseData, {
      status: backendResponse.status,
    });
  }

  return NextResponse.json(
    { message: "Serviço desvinculado com sucesso" },
    { status: 200 }
  );
});

