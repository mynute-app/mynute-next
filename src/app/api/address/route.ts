import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const POST = auth(async function POST(req) {
  const Authorization = req.auth?.accessToken;
  const email = req.auth?.user.email;

  if (!Authorization || !email) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
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

    const body = await req.json();

    const requestBody = {
      city: body.city,
      company_id: companyId, // ← agora usando o ID certo
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
