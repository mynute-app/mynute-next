import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "../../../../auth";

export const POST = auth(async function POST(req) {
  try {
    const Authorization = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!Authorization || !email) {
      return NextResponse.json({ status: 401, message: "Não autorizado" });
    }

    const body = await req.json();

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
      return NextResponse.json(
        { status: 400, message: "Usuário sem empresa associada." },
        { status: 400 }
      );
    }

    const requestBody = {
      company_id: companyId,
      name: body.name,
      surname: body.surname,
      email: body.email,
      phone: body.phone,
      password: body.password,
      role: "user",
    };

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

    revalidateTag("company");

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar funcionário:", error);
    return NextResponse.json({
      status: 500,
      error: "Erro interno ao criar o funcionário",
    });
  }
});
