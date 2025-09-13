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

    const payload = {
      ...body,
      owner_time_zone: "America/Sao_Paulo",
    };

    console.log("📤 Enviando payload:", payload);

    try {
      const backendData = await fetchFromBackend(
        req as any,
        "/company",
        "", // POST não precisa de token de auth
        {
          method: "POST",
          body: payload,
          // Ao criar empresa, ainda não existe tenant. Não resolva subdomínio e não envie headers de tenant
          skipCompanyContext: true,
        }
      );

      console.log("✅ Empresa cadastrada com sucesso");

      // Enviar email de boas-vindas após criar a empresa com sucesso
      try {
        const emailResponse = await fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/send/welcome-company`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ownerName: `${payload.owner_name} ${payload.owner_surname}`,
              companyName: payload.name,
              email: payload.owner_email,
              subdomain: payload.start_subdomain,
              owner_time_zone: payload.owner_time_zone,
            }),
          }
        );

        if (!emailResponse.ok) {
          console.warn(
            "⚠️ Falha ao enviar email de boas-vindas, mas empresa foi criada com sucesso"
          );
        } else {
          console.log("✅ Email de boas-vindas enviado com sucesso");
        }
      } catch (emailError) {
        console.error("❌ Erro ao enviar email de boas-vindas:", emailError);
        // Não falha a criação da empresa se o email falhar
      }

      return NextResponse.json(
        { message: "Empresa cadastrada com sucesso", data: backendData },
        { status: 201 }
      );
    } catch (fetchError) {
      console.error("❌ Erro ao cadastrar empresa:", fetchError);

      return NextResponse.json(
        {
          message: "Erro ao cadastrar empresa.",
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro desconhecido",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      {
        message: "Erro interno no servidor",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
