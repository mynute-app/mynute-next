import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getCompanyIdFromSubdomain } from "@/utils/subdomain";

export const PATCH = auth(async function PATCH(req) {
  try {
    const token = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!token || !email) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Log dos headers para debug
    const headers = Object.fromEntries(req.headers);
    console.log("📝 Headers recebidos:", headers);
    const host = req.headers.get("host") || "sem host";
    console.log("🌐 Host recebido no servidor:", host);
    console.log("🌐 Subdomínio extraído:", host.split(".")[0]);

    // Recebe os arquivos como multipart/form-data
    const formData = await req.formData();

    // Tenta determinar o ID da empresa
    let companyId: string | null = null;

    // 1. Tenta via formData (cliente pode enviar diretamente)
    const requestedCompanyId = formData.get("companyId");
    if (requestedCompanyId && typeof requestedCompanyId === "string") {
      companyId = requestedCompanyId;
      console.log("➡️ Company ID via formData:", companyId);
    }

    // 2. Tenta via subdomínio
    if (!companyId) {
      const host = req.headers.get("host");
      if (host) {
        const subdomain = host.split(".")[0];
        console.log("🌐 Subdomínio extraído no servidor:", subdomain);

        const subdomainId = await getCompanyIdFromSubdomain(host);
        if (subdomainId) {
          companyId = subdomainId;
          console.log("➡️ Company ID via subdomínio:", companyId);
        } else {
          console.log("⚠️ Não foi possível obter companyId do subdomínio");
        }
      }
    }

    // 3. Tenta via associação do usuário
    if (!companyId) {
      const user = await fetchFromBackend(
        req,
        `/employee/email/${email}`,
        token
      );
      companyId = user?.company_id;
      console.log("➡️ Company ID via associação do usuário:", companyId);
    }

    if (!companyId) {
      return NextResponse.json(
        { message: "Não foi possível determinar a empresa" },
        { status: 400 }
      );
    }

    // Prepara o formulário com os arquivos recebidos
    const uploadForm = new FormData();
    const fileFields = ["logo", "banner", "favicon", "background"];
    fileFields.forEach(field => {
      const file = formData.get(field);
      if (file && typeof file !== "string") {
        uploadForm.append(field, file);
      }
    }); // Processa o campo colors, se existir
    const colorsString = formData.get("colors");
    if (colorsString && typeof colorsString === "string") {
      try {
        const colors = JSON.parse(colorsString);
        console.log("🎨 Cores recebidas:", colors);

        // Adiciona as cores ao formulário para enviar ao backend
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
