import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;
    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, blocked_date_id } = (await ctx.params) as {
      employee_id: string;
      blocked_date_id: string;
    };

    await fetchFromBackend(
      req,
      `/employee/${employee_id}/blocked-dates/${blocked_date_id}`,
      token,
      { method: "DELETE" },
    );

    return NextResponse.json(
      { message: "Data bloqueada removida com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erro ao remover data bloqueada do funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
});
