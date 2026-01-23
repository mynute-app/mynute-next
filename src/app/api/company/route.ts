import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getAuthDataFromToken } from "../../../utils/decode-jwt";
import { fetchFromBackend } from "../../../lib/api/fetch-from-backend";

const resolveSchemaFromHost = (req: Request) => {
  const hostHeader = req.headers.get("host") || "";
  const host = hostHeader.split(":")[0];
  const subdomain = host.split(".")[0];
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (!subdomain || subdomain === "localhost" || isIpHost) {
    return null;
  }
  return subdomain;
};

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
    if (!companyId) {
      return NextResponse.json(
        { status: 401, message: "Company ID nao encontrado" },
        { status: 401 }
      );
    }
    try {
      const companyData = await fetchFromBackend(
        req,
        `/company/${companyId}`,
        token
      );
      return NextResponse.json(companyData);
    } catch (fetchError) {
      const schemaName = resolveSchemaFromHost(req);
      try {
        const companyData = await fetchFromBackend(
          req,
          `/company/${companyId}`,
          token,
          {
            method: "GET",
            skipCompanyContext: true,
            headers: {
              "X-Company-ID": companyId,
              ...(schemaName ? { "X-Company-Schema": schemaName } : {}),
            },
          }
        );
        return NextResponse.json(companyData);
      } catch (fallbackError) {
        return NextResponse.json(
          {
            error:
              fallbackError instanceof Error
                ? fallbackError.message
                : "Erro ao buscar empresa",
          },
          { status: 500 }
        );
      }
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

    const backendUrl = process.env.BACKEND_URL;
    const endpoint = "/company";

    console.log("\n" + "=".repeat(50));
    console.log("🌐 [ROUTE] URL Base Backend:", backendUrl);
    console.log("🔗 [ROUTE] Endpoint:", endpoint);
    console.log("🔗 [ROUTE] URL Completa:", `${backendUrl}${endpoint}`);
    console.log(
      "📤 [ROUTE] Dados enviados ao backend:",
      JSON.stringify(dataToSend, null, 2)
    );

    const backendData = await fetchFromBackend(req as any, endpoint, "", {
      method: "POST",
      body: dataToSend,
      skipCompanyContext: true, // Não precisa de contexto ao criar empresa
    });

    console.log(
      "✅ [ROUTE] Response do Backend:",
      JSON.stringify(backendData, null, 2)
    );
    console.log("=".repeat(50) + "\n");

    return NextResponse.json(
      { message: "Empresa cadastrada com sucesso", data: backendData },
      { status: 201 }
    );
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ [ROUTE] ERRO COMPLETO DO BACKEND:", error);
    console.error("❌ [ROUTE] Tipo do erro:", typeof error);
    console.error("=".repeat(50) + "\n");

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
