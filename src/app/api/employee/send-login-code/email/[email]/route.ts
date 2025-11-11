import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { email } = params;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const decodedEmail = decodeURIComponent(email);

    const host = req.headers.get("host") || "";
    const subdomain = host.split(".")[0];

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomínio não identificado" },
        { status: 400 }
      );
    }

    // Busca a empresa pelo subdomínio
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

    // Chama a API backend para enviar o código com X-Company-ID
    const response = await fetch(
      `${process.env.BACKEND_URL}/employee/send-login-code/email/${decodedEmail}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company.id,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao enviar código:", errorText);

      return NextResponse.json(
        {
          error: "Erro ao enviar código de verificação",
          details: errorText,
        },
        { status: response.status }
      );
    }

    let data = null;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.log(
            "Resposta não é JSON válido, mas código enviado com sucesso"
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Código de verificação enviado com sucesso",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar envio de código:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao enviar código de verificação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
