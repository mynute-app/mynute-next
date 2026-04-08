import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

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

    const branchList = await fetchFromBackend(req, "/branch", authData.token!, {
      method: "GET",
      queryParams: {
        page,
        page_size: pageSize,
      },
    });

    return NextResponse.json(branchList, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar as filiais.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export const POST = auth(async function POST(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
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
      },
    );

    return NextResponse.json(createdBranch, { status: 201 });
  } catch (error) {
    console.error("❌ Erro detalhado ao criar o endereço:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao criar o endereço.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});
