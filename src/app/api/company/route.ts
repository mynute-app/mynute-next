import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getAuthDataFromToken } from "../../../utils/decode-jwt";
import { fetchFromBackend } from "../../../lib/api/fetch-from-backend";

export const GET = auth(async function GET(req) {
  try {
    const token = req.auth?.accessToken;
    if (!token) {
      return NextResponse.json({
        status: 401,
        message: "Não autorizadoasdasdas",
      });
    }
    const authData = getAuthDataFromToken(token);
    const companyId = authData.companyId;
    try {
      const companyData = await fetchFromBackend(
        req,
        `/company/${companyId}`,
        token
      );
      return NextResponse.json(companyData);
    } catch (fetchError) {
      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao buscar empresa",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro ao buscar empresa:", error);
    return NextResponse.json(
      { status: 500, error: "Erro interno ao buscar empresa." },
      { status: 500 }
    );
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Remover confirmPassword
    const { confirmPassword, ...dataToSend } = body;

    console.log(
      "📤 Dados enviados ao backend:",
      JSON.stringify(dataToSend, null, 2)
    );

    const backendData = await fetchFromBackend(req as any, "/company", "", {
      method: "POST",
      body: dataToSend,
    });

    return NextResponse.json(
      { message: "Empresa cadastrada com sucesso", data: backendData },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ ERRO COMPLETO DO BACKEND:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        message: errorMessage,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
