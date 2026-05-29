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

    if (!authData.companyId) {
      return NextResponse.json(
        { message: "Company ID não encontrado no token." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: "Campos obrigatórios inválidos: name, email, phone." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "E-mail inválido." },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return NextResponse.json(
        { message: "Telefone inválido. Use o formato (11) 99999-9999." },
        { status: 400 }
      );
    }

    const phoneE164 = `+55${phoneDigits}`;

    const requestBody = {
      name,
      surname: typeof body.surname === "string" ? body.surname.trim() : "",
      email,
      phone: phoneE164,
      street: body.street || "",
      number: body.number || "",
      neighborhood: body.neighborhood || "",
      city: body.city || "",
      state: body.state || "",
      country: body.country || "",
      zip_code: body.zip_code || "",
    };

    const created = await fetchFromBackend(
      req,
      "/company-supplier",
      authData.token!,
      {
        method: "POST",
        body: requestBody,
      }
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const normalized = errorMessage.toLowerCase();

    if (normalized.includes("email") && normalized.includes("duplicate")) {
      return NextResponse.json(
        {
          code: "EMAIL_DUPLICATE",
          message: "E-mail já cadastrado.",
          error: errorMessage,
        },
        { status: 409 }
      );
    }

    console.error("❌ Erro ao criar fornecedor:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao criar fornecedor.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
});

export const GET = auth(async function GET(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    if (!authData.companyId) {
      return NextResponse.json(
        { message: "Company ID não encontrado no token." },
        { status: 400 }
      );
    }

    const { searchParams } = req.nextUrl;
    const page = String(Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
    const pageSize = String(Math.min(100, Math.max(1, parseInt(searchParams.get("page_size") || "10", 10) || 10)));
    const search = searchParams.get("search") || "";

    const queryParams: Record<string, string> = { page, page_size: pageSize };
    if (search) queryParams.search = search;

    const listResponse = await fetchFromBackend(
      req,
      "/company-supplier",
      authData.token!,
      {
        method: "GET",
        queryParams,
      }
    );

    return NextResponse.json(listResponse, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao listar fornecedores:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao listar fornecedores.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
