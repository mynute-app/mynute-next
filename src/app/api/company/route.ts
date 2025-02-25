import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const GET = auth(async function GET(req) {
  console.log("📡 Fazendo requisição direta para /company...");

  try {
    const companyResponse = await fetch(`${process.env.BACKEND_URL}/company`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("🔄 Status da resposta de /company:", companyResponse.status);

    const companyData = await companyResponse.json();
    console.log("🏢 Dados da empresa recebidos:", companyData);

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
