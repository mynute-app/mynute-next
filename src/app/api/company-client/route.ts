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

    const requestBody = {
      name: body.name,
      surname: body.surname,
      email: body.email,
      phone: body.phone,
      street: body.street || "",
      number: body.number || "",
      neighborhood: body.neighborhood || "",
      city: body.city || "",
      state: body.state || "",
      country: body.country || "",
      zip_code: body.zip_code || "",
    };

    const createdClient = await fetchFromBackend(
      req,
      "/company-client",
      authData.token!,
      {
        method: "POST",
        body: requestBody,
      }
    );

    return NextResponse.json(createdClient, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const normalized = errorMessage.toLowerCase();

    if (
      normalized.includes("idx_company_clients_phone") ||
      (normalized.includes("duplicate") && normalized.includes("phone"))
    ) {
      return NextResponse.json(
        {
          code: "PHONE_DUPLICATE",
          message: "Telefone já cadastrado.",
          error: errorMessage,
        },
        { status: 409 }
      );
    }

    if (
      normalized.includes("idx_company_clients_email") ||
      (normalized.includes("duplicate") && normalized.includes("email"))
    ) {
      return NextResponse.json(
        {
          code: "EMAIL_DUPLICATE",
          message: "E-mail já cadastrado.",
          error: errorMessage,
        },
        { status: 409 }
      );
    }

    console.error("❌ Erro ao criar cliente da empresa:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao criar cliente.",
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
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    try {
      const listResponse = await fetchFromBackend(
        req,
        "/company-client",
        authData.token!,
        {
          method: "GET",
          queryParams: {
            page,
            page_size: pageSize,
          },
        }
      );

      return NextResponse.json(listResponse, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isNotFound =
        message.includes("Erro ao acessar backend (404)") &&
        (message.includes("company_clients") ||
          message.includes("resource not found for company_id"));

      if (isNotFound) {
        return NextResponse.json(
          {
            company_clients: [],
            page: Number(page),
            page_size: Number(pageSize),
            total: 0,
          },
          { status: 200 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("❌ Erro ao listar clientes da empresa:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao listar clientes.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
