import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const POST = auth(async function POST(req) {
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const requestBody = {
      city: body.city,
      company_id: 1, 
      complement: body.complement || "",
      country: body.country,
      name: body.name,
      neighborhood: body.neighborhood || "",
      number: body.number,
      state: body.state,
      street: body.street,
      zip_code: body.zip_code,
    };

    console.log("📤 Enviando dados para API:", requestBody);

    const response = await fetch(`${process.env.BACKEND_URL}/branch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization, 
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(
        "❌ Erro na resposta do backend:",
        response.status,
        responseData
      );
      return NextResponse.json(
        { message: "Erro ao criar o endereço", error: responseData },
        { status: response.status }
      );
    }

    console.log("✅ Endereço criado com sucesso:", responseData);
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar o endereço:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o endereço.", error },
      { status: 500 }
    );
  }
});
