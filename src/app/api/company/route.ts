import { Employee } from "./../../../../types/company";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const GET = auth(async function GET(req) {
  console.log("📡 Fazendo requisição direta para /company...");

  try {
    const email = req.auth?.user.email;
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ status: 401 });
    }

    const userResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/email/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Erro ao buscar os dados do usuário");
    }

    const userData = await userResponse.json();
    console.log("👤 ID do usuário:", userData?.company.name);

    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/name/${userData?.company.name}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔄 Status da resposta de /company:", companyResponse.status);

    const companyData = await companyResponse.json();

    if (!companyResponse.ok) {
      throw new Error("Erro ao buscar os dados da empresa");
    }

    return NextResponse.json(companyData);
  } catch (error) {
    console.error("❌ Erro ao buscar dados da empresa:", error);
    return NextResponse.json({
      status: 500,
      error: "Erro interno do servidor",
    });
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
