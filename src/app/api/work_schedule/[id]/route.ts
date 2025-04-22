import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { id } = ctx.params as { id: string };
    const body = await req.json();

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify(body),
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("❌ Erro ao atualizar o work_schedule:", responseData);
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no PATCH do work_schedule:", error);
    return NextResponse.json(
      { message: "Erro interno ao atualizar os horários de trabalho" },
      { status: 500 }
    );
  }
});
