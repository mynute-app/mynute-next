import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { id } = ctx.params as { id: string };
    const body = await req.json();

    // Usando fetchFromBackend para atualizar os horários de trabalho
    const responseData = await fetchFromBackend(req, `/employee/${id}`, token, {
      method: "PATCH",
      body: body,
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no PATCH do work_schedule:", error);
    return NextResponse.json(
      { message: "Erro interno ao atualizar os horários de trabalho" },
      { status: 500 }
    );
  }
});
