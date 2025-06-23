import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export const PATCH = auth(async function PATCH(req) {
  console.log("📤 Atualizando design da empresa...");

  try {
    const token = req.auth?.accessToken;
    console.log("🔑 Token de autenticação:", token);

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Decodificar o token para pegar o company_id
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    console.log("📋 Payload do token:", payload);

    // O company_id está dentro de payload.data
    const companyId = payload.data?.company_id;
    console.log("� Company ID do token:", companyId);

    if (!companyId) {
      return NextResponse.json(
        { message: "Company ID não encontrado no token" },
        { status: 400 }
      );
    }

    // Recebe os arquivos como multipart/form-data
    const formData = await req.formData();
    console.log("📁 FormData recebido para empresa:", companyId); // Prepara o formulário com os arquivos recebidos
    const uploadForm = new FormData();
    const fileFields = ["logo", "banner", "favicon", "background"];

    fileFields.forEach(field => {
      const file = formData.get(field);
      if (file && typeof file !== "string") {
        uploadForm.append(field, file);
        console.log(`📎 Arquivo ${field} adicionado:`, file.name);
      }
    });

    // Processa o campo colors, se existir
    const colorsString = formData.get("colors");
    if (colorsString && typeof colorsString === "string") {
      try {
        const colors = JSON.parse(colorsString);
        console.log("🎨 Cores recebidas:", colors);
        uploadForm.append("colors", colorsString);
      } catch (e) {
        console.error("❌ Erro ao processar as cores:", e);
      }
    }

    // Chama o backend com os arquivos e cabeçalhos necessários
    const backendUrl = `${process.env.BACKEND_URL}/company/${companyId}/design/images`;
    console.log("📤 Enviando para backend:", backendUrl);

    const res = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "X-Auth-Token": token,
        "X-Company-ID": companyId,
      },
      body: uploadForm,
    });

    console.log("📥 Status da resposta do backend:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Erro na resposta do backend:", res.status, errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const result = await res.json();
    console.log("✅ Resposta do backend:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno ao enviar imagens" },
      { status: 500 }
    );
  }
});
