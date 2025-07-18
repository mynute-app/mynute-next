import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromToken } from "../../../utils/decode-jwt";

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
        { status: 400 }
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
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
});
