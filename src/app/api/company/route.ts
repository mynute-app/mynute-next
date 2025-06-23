import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const GET = auth(async function GET(req) {
  console.log("📡 Buscando dados da empresa com base no token...");

  try {
    const token = req.auth?.accessToken;
    console.log("🔑 Token de autenticação:", token);

    if (!token) {
      return NextResponse.json({ status: 401, message: "Não autorizado" });
    }

    // Decodificar o token para pegar o company_id
    // Assumindo que o token é JWT, vamos decodificar o payload
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return NextResponse.json({ status: 401, message: "Token inválido" });
    }
    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    console.log("📋 Payload do token:", payload);

    // O company_id está dentro de payload.data
    const companyId = payload.data?.company_id;
    console.log("🏢 Company ID do token:", companyId);

    if (!companyId) {
      return NextResponse.json(
        { status: 400, message: "Company ID não encontrado no token." },
        { status: 400 }
      );
    }
    console.log("🚀 Fazendo requisição para o backend com:");
    console.log("🔗 URL:", `${process.env.BACKEND_URL}/company/${companyId}`);
    console.log("🔑 Token original:", token);
    console.log("🏢 X-Company-ID Header:", companyId);
    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/${companyId}`,
      {
        headers: {
          "X-Auth-Token": token, // Tentando com X-Auth-Token em vez de Bearer
          "X-Company-ID": companyId,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 Status da resposta:", companyResponse.status);
    console.log(
      "📥 Headers da resposta:",
      Object.fromEntries(companyResponse.headers)
    );

    if (!companyResponse.ok) {
      const error = await companyResponse.text();
      console.error("❌ Erro ao buscar empresa:", error);
      console.error(
        "❌ Status completo:",
        companyResponse.status,
        companyResponse.statusText
      );

      // Se for erro 400 relacionado ao banco, tentar novamente ou retornar um erro mais específico
      if (companyResponse.status === 400 && error.includes("company_sectors")) {
        console.warn(
          "⚠️ Erro relacionado à tabela company_sectors - possível problema temporário no banco"
        );
        return NextResponse.json(
          {
            error:
              "Serviço temporariamente indisponível. Tente novamente em alguns segundos.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ error }, { status: companyResponse.status });
    }

    const companyData = await companyResponse.json();
    return NextResponse.json(companyData);
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

    console.log("📤 Enviando payload:", body);

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const backendText = await backendResponse.text();
    let backendJson;
    try {
      backendJson = JSON.parse(backendText);
    } catch {
      backendJson = backendText;
    }

    console.log("📥 Resposta do Backend:", {
      status: backendResponse.status,
      response: backendJson,
    });
    if (backendResponse.ok) {
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
              ownerName: `${body.owner_name} ${body.owner_surname}`,
              companyName: body.name,
              email: body.owner_email,
              subdomain: body.start_subdomain,
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
        { message: "Empresa cadastrada com sucesso", data: backendJson },
        { status: 201 }
      );
    }
    let errorMessage = "Erro ao cadastrar empresa.";

    if (typeof backendJson === "object" && backendJson !== null) {
      if (backendJson.inner_error) {
        const innerErrors = Object.values(backendJson.inner_error);
        if (innerErrors.length > 0) {
          errorMessage = innerErrors[0] as string;
        }
      } else if (backendJson.message) {
        errorMessage = backendJson.message;
      } else if (typeof backendJson === "string") {
        errorMessage = backendJson;
      }
    } else if (typeof backendJson === "string") {
      errorMessage = backendJson;
    }

    return NextResponse.json(
      {
        message: "Erro ao cadastrar empresa.",
        backendResponse: errorMessage,
      },
      { status: backendResponse.status }
    );
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
