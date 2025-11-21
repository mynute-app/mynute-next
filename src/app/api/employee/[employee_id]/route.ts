import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = ctx.params as {
      employee_id: string;
    };

    await fetchFromBackend(req, `/employee/${employee_id}`, token, {
      method: "DELETE",
    });

    revalidateTag("company");

    return NextResponse.json(
      { message: "Funcionário deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao deletar funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno ao deletar o funcionário" },
      { status: 500 }
    );
  }
});
