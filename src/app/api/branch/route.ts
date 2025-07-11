import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const POST = auth(async function POST(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }
    const body = await req.json();

    const requestBody = {
      city: body.city,
      company_id: authData.companyId,
      complement: body.complement || "",
      country: body.country,
      name: body.name,
      neighborhood: body.neighborhood || "",
      number: body.number,
      state: body.state,
      street: body.street,
      time_zone: body.timezone || "America/Sao_Paulo",
      zip_code: body.zip_code,
    };

    const createdBranch = await fetchFromBackend(
      req,
      "/branch",
      authData.token!,
      {
        method: "POST",
        body: requestBody,
      }
    );

    return NextResponse.json(createdBranch, { status: 201 });
  } catch (error) {
    console.error("❌ Erro detalhado ao criar o endereço:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao criar o endereço.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
