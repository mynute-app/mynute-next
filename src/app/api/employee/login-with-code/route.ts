import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email e código são obrigatórios" },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "";
    const subdomain = host.split(".")[0];

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomínio não identificado" },
        { status: 400 }
      );
    }

    const companyRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/company/subdomain/${subdomain}`,
      { cache: "no-store" }
    );

    if (!companyRes.ok) {
      return NextResponse.json(
        { error: "Empresa não encontrada para o subdomínio" },
        { status: 404 }
      );
    }

    const company = await companyRes.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/employee/login-with-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company.id,
        },
        body: JSON.stringify({ email, code }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao fazer login com código:", errorText);

      return NextResponse.json(
        {
          error: "Código inválido ou expirado",
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Captura o token do header
    const token = response.headers.get("X-Auth-Token");

    if (!token) {
      console.error("Token X-Auth-Token não encontrado nos headers");
      return NextResponse.json(
        { error: "Token não encontrado na resposta" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        token,
        companyId: company.id,
        subdomain,
        email,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar login com código:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao processar login",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
