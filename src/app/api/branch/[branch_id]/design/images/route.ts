import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { getCompanyFromRequest } from "@/lib/api/get-company-from-request";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id } = ctx.params as {
      branch_id: string;
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

    // Fazer a requisição para o backend
    const backendUrl = `${process.env.BACKEND_URL}/branch/${branch_id}/design/images`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "X-Auth-Token": token,
        "X-Company-ID": company.id,
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

      // Tentar pegar a resposta como JSON primeiro
      let backendError = null;
      try {
        backendError = await response.json();
      } catch (jsonError) {
        // Se não for JSON, pegar como texto
        try {
          backendError = await response.text();
        } catch (textError) {
          backendError = { message: "Erro desconhecido do backend" };
        }
      }

      return NextResponse.json(
        {
          message:
            typeof backendError === "string"
              ? backendError
              : backendError?.message || "Erro do backend",
          backendError: backendError,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    const { branch_id } = ctx.params as { branch_id: string };

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

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
});
