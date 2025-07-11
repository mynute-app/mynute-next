import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { getCompanyFromRequest } from "@/lib/api/get-company-from-request";

export const POST = auth(async function POST(req, ctx) {
  try {
    console.log("🔍 Iniciando upload de imagem...");

    const token = req.auth?.accessToken;
    console.log("🔑 Token:", token ? "Presente" : "Ausente");

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = ctx.params as {
      employee_id: string;
    };
    console.log("👤 Employee ID:", employee_id);

    // Pegar os dados do FormData
    const formData = await req.formData();
    const profileImage = formData.get("profile") as File;
    console.log(
      "🖼️ Imagem recebida:",
      profileImage ? profileImage.name : "Nenhuma"
    );

    if (!profileImage) {
      console.log("❌ Nenhuma imagem enviada");
      return NextResponse.json(
        { message: "Nenhuma imagem foi enviada" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    console.log("📁 Tipo do arquivo:", profileImage.type);
    if (!allowedTypes.includes(profileImage.type)) {
      console.log("❌ Tipo de arquivo não suportado:", profileImage.type);
      return NextResponse.json(
        { message: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    console.log("📏 Tamanho do arquivo:", profileImage.size, "bytes");
    if (profileImage.size > maxSize) {
      console.log("❌ Arquivo muito grande:", profileImage.size);
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
    console.log("� Company:", company);

    // Fazer a requisição para o backend
    const backendUrl = `${process.env.BACKEND_URL}/employee/${employee_id}/design/images`;
    console.log("🔗 URL completa:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "X-Auth-Token": token,
        "X-Company-ID": company.id,
        ...(company.schema_name && {
          "X-Company-Schema": company.schema_name,
        }),
      },
      body: backendFormData,
    });

    console.log("📡 Status da resposta:", response.status);
    console.log(
      "📡 Headers da resposta:",
      Object.fromEntries(response.headers.entries())
    );

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
    console.log("✅ Resposta do backend:", responseData);

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

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = ctx.params as {
      employee_id: string;
    };

    // Obter company data via subdomain
    const company = await getCompanyFromRequest(req);

    // Fazer a requisição DELETE para o backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/employee/${employee_id}/design/images`,
      {
        method: "DELETE",
        headers: {
          "X-Auth-Token": token,
          "X-Company-ID": company.id,
          ...(company.schema_name && {
            "X-Company-Schema": company.schema_name,
          }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Erro na API backend:", errorData);
      return NextResponse.json(
        { message: "Erro ao remover a imagem" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Imagem removida com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao processar remoção da imagem:", error);
    return NextResponse.json(
      { message: "Erro interno ao remover a imagem" },
      { status: 500 }
    );
  }
});
