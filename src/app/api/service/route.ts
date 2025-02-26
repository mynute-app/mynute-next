import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Criando o objeto com os dados necessários
    const requestBody = {
      name: body.name,
      description: body.description,
      price: Number(body.price), // Garantindo que seja um número
      duration: Number(body.duration), // Garantindo que seja um número
      company_id: 1, // 🔥 Company ID fixo
    };

    // Fazendo a requisição para o backend real
    const response = await fetch("http://localhost:4000/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
}
