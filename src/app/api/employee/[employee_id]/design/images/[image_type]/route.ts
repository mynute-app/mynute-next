import { NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";
import { getCompanyFromRequest } from "@/lib/api/get-company-from-request";

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, image_type } = ctx.params as {
      employee_id: string;
      image_type: string;
    };

    // Obter company data via subdomain
    const company = await getCompanyFromRequest(req);

    // Fazer a requisição DELETE para o backend com image_type
    const backendUrl = `${process.env.BACKEND_URL}/employee/${employee_id}/design/images/${image_type}`;

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "X-Auth-Token": token,
        "X-Company-ID": company.id,
        ...(company.schema_name && {
          "X-Company-Schema": company.schema_name,
        }),
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Erro na API backend:", errorData);
      console.error("❌ Status:", response.status);
      console.error("❌ StatusText:", response.statusText);
      return NextResponse.json(
        { message: "Erro ao remover a imagem", details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Imagem removida com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao processar remoção da imagem:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "Sem stack trace"
    );
    return NextResponse.json(
      {
        message: "Erro interno ao remover a imagem",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
});
