import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const POST = auth(async function POST(req) {
  try {
    const body = await req.json();

    const email = req.auth?.user.email;
    const Authorization = req.auth?.accessToken;

    if (!email || !Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const userResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/email/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Erro ao buscar os dados do usuário.");
    }

    const userData = await userResponse.json();
    const companyId = userData?.company?.id;

    if (!companyId) {
      throw new Error("Usuário não possui uma empresa associada.");
    }

    const requestBody = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      duration: Number(body.duration),
      company_id: companyId,
    };

    const response = await fetch(`${process.env.BACKEND_URL}/service`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar o serviço.");
    }

    const createdService = await response.json();
    return NextResponse.json(createdService, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar o serviço:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o serviço." },
      { status: 500 }
    );
  }
});
