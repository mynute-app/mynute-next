import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req) {
  try {
    const token = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!token || !email) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const user = await fetchFromBackend(req, `/employee/email/${email}`, token);

    const companyId = user?.company_id;
    if (!companyId) {
      return NextResponse.json(
        { message: "Usuário sem empresa associada" },
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

    // Usando fetchFromBackend para criar o funcionário
    const createdEmployee = await fetchFromBackend(req, "/employee", token, {
      method: "POST",
      body: requestBody,
    });

    console.log("✅ Funcionário criado com sucesso:", createdEmployee);

    revalidateTag("company");

    return NextResponse.json(createdEmployee, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o funcionário" },
      { status: 500 }
    );
  }
});
