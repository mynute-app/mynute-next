import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export const GET = auth(async function GET(req, { params }) {
  console.log("📡 Fazendo requisição para obter dados da empresa...");

  try {
    const companyId = params?.id;
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ status: 401, message: "Não autorizado" });
    }

    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/${companyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        next: { tags: ["company"] }, // 🔥 Adicionando tag para invalidar o cache dinamicamente
      }
    );

    console.log("🔄 Status da resposta de /company:", companyResponse.status);

    if (!companyResponse.ok) {
      throw new Error("Erro ao buscar os dados da empresa");
    }

    const companyData = await companyResponse.json();
    return NextResponse.json(companyData);
  } catch (error) {
    console.error("❌ Erro ao buscar dados da empresa:", error);
    return NextResponse.json({
      status: 500,
      error: "Erro interno do servidor",
    });
  }
});
