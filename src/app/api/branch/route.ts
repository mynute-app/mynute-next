import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req) {
  try {
    const token = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!email || !token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = await fetchFromBackend(req, `/employee/email/${email}`, token);

    const companyId = user?.company_id;
    if (!companyId) {
      return NextResponse.json(
        { message: "Usuário sem empresa associada" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const requestBody = {
      city: body.city,
      company_id: companyId,
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

    const createdBranch = await fetchFromBackend(req, "/branch", token, {
      method: "POST",
      body: requestBody,
    });

    console.log("✅ Endereço criado com sucesso:", createdBranch);
    return NextResponse.json(createdBranch, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar o endereço:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o endereço." },
      { status: 500 }
    );
  }
});
