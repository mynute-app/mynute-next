// Exemplo de como usar a função getAuthDataFromToken em qualquer rota

import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { getAuthDataFromToken } from "@/utils/decode-jwt";

export const GET = auth(async function GET(req) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json(
        { message: "Token não encontrado" },
        { status: 401 }
      );
    }

    // ✨ Uma única chamada para obter tudo que você precisa
    const authData = getAuthDataFromToken(token);

    if (!authData.isValid) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    // Agora você tem acesso a:
    console.log("📧 Email:", authData.email);
    console.log("🏢 Company ID:", authData.companyId);
    console.log("👤 Dados completos do usuário:", authData.user);

    // Exemplo de uso em uma query/operação
    const result = {
      userEmail: authData.email,
      companyId: authData.companyId,
      userId: authData.user?.id,
      userName: `${authData.user?.name} ${authData.user?.surname}`,
      userPhone: authData.user?.phone,
      isVerified: authData.user?.verified,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erro na rota:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
});

export const POST = auth(async function POST(req) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json(
        { message: "Token não encontrado" },
        { status: 401 }
      );
    }

    const authData = getAuthDataFromToken(token);

    if (!authData.isValid || !authData.companyId) {
      return NextResponse.json(
        {
          message: "Dados de autenticação insuficientes",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Exemplo: sempre incluir company_id nas operações
    const dataToSave = {
      ...body,
      company_id: authData.companyId,
      created_by: authData.user?.id,
      user_email: authData.email,
    };

    console.log("💾 Salvando dados:", dataToSave);

    // Aqui você faria a operação com o backend
    // const result = await fetchFromBackend(req, "/endpoint", token, {
    //   method: "POST",
    //   body: dataToSave
    // });

    return NextResponse.json({
      message: "Dados salvos com sucesso",
      companyId: authData.companyId,
    });
  } catch (error) {
    console.error("❌ Erro na rota POST:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
});
