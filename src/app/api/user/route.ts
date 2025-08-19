import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const GET = auth(async function GET(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid || !authData.user?.id || !authData.token) {
      return NextResponse.json(
        { message: authData.error || "Não autorizado" },
        { status: 401 }
      );
    }

    // Busca os dados completos do usuário atual pelo ID do token
    const user = await fetchFromBackend(
      req,
      `/employee/${authData.user.id}`,
      authData.token
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro no GET /api/user:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
});

export const PATCH = auth(async function PATCH(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid || !authData.user?.id || !authData.token) {
      return NextResponse.json(
        { message: authData.error || "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, surname } = body as { name?: string; surname?: string };

    const updatedUser = await fetchFromBackend(
      req,
      `/employee/${authData.user.id}`,
      authData.token,
      {
        method: "PATCH",
        body: { name, surname },
      }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro no PATCH /api/user:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
});
