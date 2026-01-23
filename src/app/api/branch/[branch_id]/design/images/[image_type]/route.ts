import { NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    console.log("🗑️ Iniciando remoção de imagem da filial...");

    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const { branch_id, image_type } = (await ctx.params) as {
      branch_id: string;
      image_type: string;
    };

    console.log("🏢 Branch ID:", branch_id);
    console.log("🖼️ Image Type:", image_type);

    // Validar tipos de imagem permitidos
    const allowedImageTypes = [
      "profile",
      "logo",
      "banner",
      "background",
      "favicon",
    ];
    if (!allowedImageTypes.includes(image_type)) {
      return NextResponse.json(
        {
          message: `Tipo de imagem inválido. Use: ${allowedImageTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Fazer a requisição DELETE para o backend com o image_type na URL
    const backendUrl = `${process.env.BACKEND_URL}/branch/${branch_id}/design/images/${image_type}`;
    console.log("🔗 URL completa:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "X-Auth-Token": authData.token!,
        "X-Company-ID": authData.companyId!,
      },
    });

    console.log("📡 Status da resposta:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Erro na API backend:", errorData);
      return NextResponse.json(
        { message: `Erro ao remover a imagem ${image_type} da filial` },
        { status: response.status }
      );
    }

    console.log(`✅ Imagem ${image_type} da filial removida com sucesso`);
    return NextResponse.json(
      { message: `Imagem ${image_type} da filial removida com sucesso` },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro ao processar remoção da imagem da filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao remover a imagem da filial" },
      { status: 500 }
    );
  }
});

