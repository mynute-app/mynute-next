import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getCompanyFromRequest } from "@/lib/api/get-company-from-request";

export const GET = auth(async function GET(req) {
  console.log("📡 Buscando dados da empresa com base no subdomínio...");

  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ status: 401, message: "Não autorizadoasdas" });
    }

    // Pegando a empresa do subdomínio
    const company = await getCompanyFromRequest(req);

    if (!company?.id) {
      return NextResponse.json(
        { status: 400, message: "Empresa não encontrada via subdomínio." },
        { status: 400 }
      );
    }

    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/${company.id}`
    );

    if (!companyResponse.ok) {
      const error = await companyResponse.text();
      console.error("❌ Erro ao buscar empresa:", error);
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
