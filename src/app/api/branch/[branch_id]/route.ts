import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req, { params }) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const branchId = params?.branch_id;

    // Busca os dados da filial
    const branchData = await fetchFromBackend(
      req,
      `/branch/${branchId}`,
      token
    );

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
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const branchId = params?.branch_id;
    const branchData = await fetchFromBackend(
      req,
      `/branch/${branchId}`,
      token
    );

    const requestBody = {
      company_id: branchData.company_id,
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

    // Atualiza a filial usando o fetchFromBackend
    const updatedBranch = await fetchFromBackend(
      req,
      `/branch/${branchId}`,
      token,
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
