import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET    /api/inventory/products/[id]  — Busca produto por ID
 * PATCH  /api/inventory/products/[id]  — Atualiza produto
 * DELETE /api/inventory/products/[id]  — Remove produto
 */

export const GET = auth(async function GET(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id } = (await ctx.params) as { id: string };

    if (!id) {
      return NextResponse.json(
        { message: "ID do produto é obrigatório" },
        { status: 400 },
      );
    }

    const result = await fetchFromBackend(
      req,
      `/inventory/product/${id}`,
      authData.token!,
      { method: "GET" },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar produto.",
      },
      { status: 500 },
    );
  }
});

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id } = (await ctx.params) as { id: string };

    if (!id) {
      return NextResponse.json(
        { message: "ID do produto é obrigatório" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const result = await fetchFromBackend(
      req,
      `/inventory/product/${id}`,
      authData.token!,
      { method: "PATCH", body },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao atualizar produto.",
      },
      { status: 500 },
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id } = (await ctx.params) as { id: string };

    if (!id) {
      return NextResponse.json(
        { message: "ID do produto é obrigatório" },
        { status: 400 },
      );
    }

    await fetchFromBackend(req, `/inventory/product/${id}`, authData.token!, {
      method: "DELETE",
    });

    return NextResponse.json({ message: "Produto removido com sucesso." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao remover produto.",
      },
      { status: 500 },
    );
  }
});
