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

    const resolvedParams = await params;
    const supplierId = resolvedParams?.id;

    if (!supplierId) {
      return NextResponse.json(
        { message: "ID do fornecedor não informado." },
        { status: 400 }
      );
    }

    const supplier = await fetchFromBackend(
      req,
      `/company-supplier/${supplierId}`,
      authData.token!,
      { method: "GET" }
    );

    return NextResponse.json(supplier, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar fornecedor:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar fornecedor." },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async function PATCH(req, { params }) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const supplierId = resolvedParams?.id;

    if (!supplierId) {
      return NextResponse.json(
        { message: "ID do fornecedor não informado." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateBody: Record<string, string> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updateBody.name = body.name.trim();
    }
    if (typeof body.surname === "string") {
      updateBody.surname = body.surname.trim();
    }
    if (typeof body.email === "string" && body.email.trim()) {
      updateBody.email = body.email.trim();
    }
    if (typeof body.phone === "string" && body.phone.trim()) {
      const phoneDigits = body.phone.replace(/\D/g, "");
      updateBody.phone = `+55${phoneDigits}`;
    }
    const addressFields = ["street", "number", "neighborhood", "city", "state", "country", "zip_code"];
    for (const field of addressFields) {
      if (typeof body[field] === "string") {
        updateBody[field] = body[field];
      }
    }

    const updated = await fetchFromBackend(
      req,
      `/company-supplier/${supplierId}`,
      authData.token!,
      { method: "PATCH", body: updateBody }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao atualizar fornecedor:", error);
    return NextResponse.json(
      { message: "Erro interno ao atualizar fornecedor." },
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

    const resolvedParams = await params;
    const supplierId = resolvedParams?.id;

    if (!supplierId) {
      return NextResponse.json(
        { message: "ID do fornecedor não informado." },
        { status: 400 }
      );
    }

    await fetchFromBackend(
      req,
      `/company-supplier/${supplierId}`,
      authData.token!,
      { method: "DELETE" }
    );

    return NextResponse.json(
      { message: "Fornecedor deletado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao deletar fornecedor:", error);
    return NextResponse.json(
      { message: "Erro interno ao deletar fornecedor." },
      { status: 500 }
    );
  }
});
