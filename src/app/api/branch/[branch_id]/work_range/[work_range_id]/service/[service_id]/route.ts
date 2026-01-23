import { NextResponse } from "next/server";
import { auth } from "../../../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, work_range_id, service_id } = (await ctx.params) as {
      branch_id: string;
      work_range_id: string;
      service_id: string;
    };

    console.log("🔍 DELETE Branch ID:", branch_id);
    console.log("🔍 DELETE Work Range ID:", work_range_id);
    console.log("🔍 DELETE Service ID:", service_id);

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_range/${work_range_id}/service/${service_id}`,
      token,
      {
        method: "DELETE",
      }
    );

    console.log("✅ Sucesso com DELETE (work_range service):", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao remover serviço do work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});

