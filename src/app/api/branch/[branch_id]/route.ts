import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const GET = auth(async function GET(req, { params }) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const branchId = params?.branch_id;
    console.log("🏢 Buscando filial:", branchId);

    // Busca os dados da filial
    const branchData = await fetchFromBackend(
      req,
      `/branch/${branchId}`,
      authData.token!
    );

    console.log("✅ Filial encontrada:", branchData);
    return NextResponse.json(branchData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar a filial." },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async function PATCH(req, { params }) {
  try {
    // Uma linha só - busca token do NextAuth, decodifica e retorna tudo
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const branchId = params?.branch_id;
    console.log("🏢 Atualizando filial:", branchId);
    console.log("📋 Dados recebidos:", authData.companyId);

    const requestBody = {
      name: body.name,
      street: body.street,
      number: body.number,
      complement: body.complement || "",
      neighborhood: body.neighborhood || "",
      zip_code: body.zip_code,
      city: body.city,
      state: body.state,
      country: body.country,
    };

    console.log("📤 Enviando dados para API backend:", requestBody);

    // Atualiza a filial usando o fetchFromBackend
    const updatedBranch = await fetchFromBackend(
      req,
      `/branch/${branchId}`,
      authData.token!,
      {
        method: "PATCH",
        body: requestBody,
      }
    );

    console.log("✅ Filial atualizada com sucesso:", updatedBranch);
    return NextResponse.json(updatedBranch, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao editar filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao editar a filial." },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, { params }) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const branchId = params?.branch_id;
    console.log("🗑️ Deletando filial:", branchId);

    // Deleta a filial usando o fetchFromBackend
    const deletedBranch = await fetchFromBackend(
      req,
      `/branch/${branchId}`,
      authData.token!,
      {
        method: "DELETE",
      }
    );

    console.log("✅ Filial deletada com sucesso:", deletedBranch);
    return NextResponse.json(deletedBranch, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao deletar filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao deletar a filial." },
      { status: 500 }
    );
  }
});
