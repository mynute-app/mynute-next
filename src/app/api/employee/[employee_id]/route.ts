import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = (await ctx.params) as {
      employee_id: string;
    };

    const body = await req.json();

    const requestBody: Record<string, unknown> = {};

    if (body.name !== undefined) requestBody.name = body.name;
    if (body.surname !== undefined) requestBody.surname = body.surname;
    if (body.email !== undefined) requestBody.email = body.email;
    if (body.phone !== undefined) requestBody.phone = body.phone;
    if (body.is_active !== undefined) requestBody.is_active = body.is_active;

    const updatedEmployee = await fetchFromBackend(
      req,
      `/employee/${employee_id}`,
      token,
      {
        method: "PATCH",
        body: requestBody,
      },
    );

    revalidateTag("company", "max");

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao atualizar funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno ao atualizar o funcionário" },
      { status: 500 },
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = (await ctx.params) as {
      employee_id: string;
    };

    await fetchFromBackend(req, `/employee/${employee_id}`, token, {
      method: "DELETE",
    });

    revalidateTag("company", "max");

    return NextResponse.json(
      { message: "Funcionário deletado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erro ao deletar funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno ao deletar o funcionário" },
      { status: 500 },
    );
  }
});
