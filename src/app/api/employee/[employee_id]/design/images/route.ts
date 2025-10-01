import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { getCompanyFromRequest } from "@/lib/api/get-company-from-request";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = ctx.params as {
      employee_id: string;
    };

    // Pegar os dados do FormData
    const formData = await req.formData();
    const profileImage = formData.get("profile") as File;

    if (!profileImage) {
      return NextResponse.json(
        { message: "Nenhuma imagem foi enviada" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(profileImage.type)) {
      return NextResponse.json(
        { message: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (profileImage.size > maxSize) {
      return NextResponse.json(
        { message: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Preparar FormData para enviar para a API backend
    const backendFormData = new FormData();
    backendFormData.append("profile", profileImage);

    // Obter company data via subdomain
    const company = await getCompanyFromRequest(req);

    // Fazer a requisição para o backend usando PATCH
    const backendUrl = `${process.env.BACKEND_URL}/employee/${employee_id}/design/images`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "X-Auth-Token": token,
        "X-Company-ID": company.id,
        ...(company.schema_name && {
          "X-Company-Schema": company.schema_name,
        }),
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Erro na API backend:", errorData);
      console.error("❌ Status:", response.status);
      console.error("❌ StatusText:", response.statusText);
      return NextResponse.json(
        { message: "Erro ao fazer upload da imagem", details: errorData },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar upload da imagem:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "Sem stack trace"
    );
    return NextResponse.json(
      {
        message: "Erro interno ao fazer upload da imagem",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
});
