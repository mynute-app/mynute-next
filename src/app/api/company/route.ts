import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const GET = auth(async function GET(req) {
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ status: 401 });
  }

  try {
    // 1️⃣ Buscar os dados do usuário primeiro
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/user`,
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
    const companyId = userData.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "Usuário não possui empresa vinculada" },
        { status: 404 }
      );
    }

    // 2️⃣ Buscar os dados da empresa usando o `companyId`
    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/${companyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
      }
    );

    if (!companyResponse.ok) {
      throw new Error("Erro ao buscar os dados da empresa");
    }

    const companyData = await companyResponse.json();

    return NextResponse.json(companyData);
  } catch (error) {
    console.error("Erro ao buscar dados da empresa:", error);
    return NextResponse.json({
      status: 500,
      error: "Erro interno do servidor",
    });
  }
});
