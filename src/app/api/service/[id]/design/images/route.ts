import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    console.log("🔍 Iniciando upload de imagem do serviço...");

    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const { id } = ctx.params as {
      id: string;
    };
    console.log("🛠️ Service ID:", id);

    // Pegar os dados do FormData
    const formData = await req.formData();
    const mainImage = formData.get("main") as File;
    console.log("🖼️ Imagem recebida:", mainImage ? mainImage.name : "Nenhuma");

    if (!mainImage) {
      console.log("❌ Nenhuma imagem enviada");
      return NextResponse.json(
        { message: "Nenhuma imagem foi enviada" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    console.log("📁 Tipo do arquivo:", mainImage.type);
    if (!allowedTypes.includes(mainImage.type)) {
      console.log("❌ Tipo de arquivo não suportado:", mainImage.type);
      return NextResponse.json(
        { message: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    console.log("📏 Tamanho do arquivo:", mainImage.size, "bytes");
    if (mainImage.size > maxSize) {
      console.log("❌ Arquivo muito grande:", mainImage.size);
      return NextResponse.json(
        { message: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Preparar FormData para enviar para a API backend
    const backendFormData = new FormData();
    backendFormData.append("main", mainImage);

    // Fazer a requisição para o backend
    const backendUrl = `${process.env.BACKEND_URL}/service/${id}/design/images`;
    console.log("🔗 URL completa:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "X-Auth-Token": authData.token!,
        "X-Company-ID": authData.companyId!,
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
        {
          message: "Erro ao fazer upload da imagem do serviço",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("✅ Resposta do backend:", responseData);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar upload da imagem do serviço:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "Sem stack trace"
    );
    return NextResponse.json(
      {
        message: "Erro interno ao fazer upload da imagem do serviço",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
});
