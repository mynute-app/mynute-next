import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "../../../../auth";

export const POST = auth(async function POST(req) {
  console.log("📡 Criando novo funcionário...");

  try {
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ status: 401, message: "Não autorizado" });
    }

    const body = await req.json();

    const requestBody = {
      company_id: 1,
      name: body.name,
      surname: body.surname,
      email: body.email,
      phone: body.phone,
      password: body.password,
      role: body.role || "user",
    };

    console.log("📤 Enviando dados para backend:", requestBody);

    const response = await fetch(`${process.env.BACKEND_URL}/employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("🔄 Status da resposta de /employee:", response.status);

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Erro na resposta do backend:", responseData);
      return NextResponse.json(responseData, { status: response.status });
    }

    console.log("✅ Funcionário criado com sucesso:", responseData);

    revalidateTag("company"); // 🔥 Invalida o cache para forçar atualização dos dados da empresa

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar funcionário:", error);
    return NextResponse.json({
      status: 500,
      error: "Erro interno ao criar o funcionário",
    });
  }
});
