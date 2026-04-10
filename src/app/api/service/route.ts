import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import {
  getAuthDataFromRequest,
  getAuthDataFromToken,
} from "../../../utils/decode-jwt";

export const GET = auth(async function GET(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    const serviceList = await fetchFromBackend(
      req,
      "/service",
      authData.token!,
      {
        method: "GET",
        queryParams: { page, page_size: pageSize },
      },
    );

    return NextResponse.json(serviceList, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar os serviços.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export const POST = auth(async function POST(req) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Usar o utilitário para decodificar o token
    const authData = getAuthDataFromToken(token);

    if (!authData.isValid) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    if (!authData.companyId) {
      return NextResponse.json(
        { message: "Company ID não encontrado no token" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const requestBody = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      duration: Number(body.duration),
      company_id: authData.companyId,
    };

    try {
      const createdService = await fetchFromBackend(req, "/service", token, {
        method: "POST",
        body: requestBody,
      });

      return NextResponse.json(createdService, { status: 201 });
    } catch (fetchError) {
      console.error("❌ Erro ao criar o serviço:", fetchError);

      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao criar serviço",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
});
