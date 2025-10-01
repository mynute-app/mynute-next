import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
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

    // Pegar os dados do FormData
    const formData = await req.formData();

    // Tentar encontrar uma imagem em qualquer um dos campos possíveis
    const imageTypes = [
      "profile",
      "main",
      "logo",
      "banner",
      "background",
      "favicon",
    ];
    let imageFile: File | null = null;
    let imageType: string | null = null;

    for (const type of imageTypes) {
      const file = formData.get(type) as File;
      if (file) {
        imageFile = file;
        imageType = type;
        break;
      }
    }

    if (!imageFile) {
      return NextResponse.json(
        { message: "Nenhuma imagem foi enviada" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { message: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { message: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Preparar FormData para enviar para a API backend
    const backendFormData = new FormData();
    backendFormData.append(imageType!, imageFile); // Usar o tipo correto da imagem

    // Fazer a requisição para o backend
    const backendUrl = `${process.env.BACKEND_URL}/service/${id}/design/images`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "X-Auth-Token": authData.token!,
        "X-Company-ID": authData.companyId!,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      // Capturar especificamente o erro 413
      if (response.status === 413) {
        return NextResponse.json(
          {
            message:
              "Arquivo muito grande. O backend não aceita arquivos desse tamanho.",
            error: "FILE_TOO_LARGE",
            status: 413,
          },
          { status: 413 }
        );
      }

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

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    const { id } = ctx.params as { id: string };

    if (error instanceof Error && error.message.includes("fetch failed")) {
      const errorCause = error.cause as any;

      // Verificar se é erro de tamanho de arquivo
      if (
        errorCause &&
        (errorCause.code === "ECONNABORTED" ||
          errorCause.message?.includes("write ECONNABORTED") ||
          errorCause.errno === -4079)
      ) {
        return NextResponse.json(
          {
            message: "Arquivo muito grande. Tente com um arquivo menor.",
            error: "FILE_TOO_LARGE_CONNECTION",
            details:
              "A conexão foi abortada, provavelmente devido ao tamanho do arquivo",
          },
          { status: 413 }
        );
      }

      return NextResponse.json(
        {
          message:
            "Backend não está respondendo. Verifique se o serviço está rodando.",
          error: "CONNECTION_ERROR",
        },
        { status: 503 }
      );
    }

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
