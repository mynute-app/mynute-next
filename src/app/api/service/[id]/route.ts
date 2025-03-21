import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export const PATCH = auth(async function PATCH(req, { params }) {
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const serviceId = params?.id;

    const requestBody = {
      name: body.name,
      description: body.description,
      price: body.price,
      duration: body.duration,
    };

    console.log("📤 Enviando dados para API:", requestBody);

    const response = await fetch(
      `${process.env.BACKEND_URL}/service/${serviceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error(
        "❌ Erro ao atualizar serviço:",
        response.status,
        responseData
      );
      return NextResponse.json(
        { message: "Erro ao atualizar o serviço", error: responseData },
        { status: response.status }
      );
    }

    console.log("✅ Serviço atualizado com sucesso:", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao editar serviço:", error);
    return NextResponse.json(
      { message: "Erro interno ao editar o serviço.", error },
      { status: 500 }
    );
  }
});
