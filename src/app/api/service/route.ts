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
      name: body.name,
      description: body.description,
      price: Number(body.price),
      duration: Number(body.duration),
      company_id: companyId,
    };

    const createdService = await fetchFromBackend(req, "/service", token, {
      method: "POST",
      body: requestBody,
    });

    return NextResponse.json(createdService, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar o serviço:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o serviço." },
      { status: 500 }
    );
  }
});
