import { Employee } from "./../../../../types/company";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req) {
  console.log("📡 Buscando dados da empresa com base no usuário...");

  try {
    const token = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!token || !email) {
      return NextResponse.json({ status: 401, message: "Não autorizado" });
    }

    const user = await fetchFromBackend(req, `/employee/email/${email}`, token);

    const companyId = user?.company_id;
    console.log("", companyId);
    if (!companyId) {
      return NextResponse.json(
        { status: 400, message: "Usuário sem empresa associada." },
        { status: 400 }
      );
    }

    // Passo 2: buscar empresa pelo ID
    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/${companyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("", companyResponse);
    if (!companyResponse.ok) {
      const error = await companyResponse.text();
      console.error("❌ Erro ao buscar empresa:", error);
      return NextResponse.json({ error }, { status: companyResponse.status });
    }

    const company = await companyResponse.json();

    console.log("✅ Empresa encontrada:", company);

    return NextResponse.json(company);
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
      return NextResponse.json(
        { message: "Empresa cadastrada com sucesso", data: backendJson },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: "Erro ao cadastrar empresa.",
        backendResponse: backendJson,
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
