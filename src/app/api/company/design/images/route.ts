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
        const subdomainId = await getCompanyIdFromSubdomain(host);
        if (subdomainId) {
          companyId = subdomainId;
          console.log("➡️ Company ID via subdomínio:", companyId);
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
    });

    // Chama o backend com os arquivos e cabeçalhos necessários
    const res = await fetch(
      `${process.env.BACKEND_URL}/company/${companyId}/design/images`,
      {
        method: "PATCH",
        headers: {
          "X-Auth-Token": token,
          "X-Company-ID": companyId,
        },
        body: uploadForm,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno ao enviar imagens" },
      { status: 500 }
    );
  }
});
