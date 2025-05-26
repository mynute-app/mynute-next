import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const PATCH = auth(async function PATCH(req) {
  try {
    const token = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!token || !email) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Busca o usuário e obtém o ID da empresa
    const user = await fetchFromBackend(req, `/employee/email/${email}`, token);
    const companyId = user?.company_id;

    if (!companyId) {
      return NextResponse.json(
        { message: "Usuário sem empresa associada" },
        { status: 400 }
      );
    }

    // Converte o corpo em formData
    const formData = await req.formData();

    const uploadForm = new FormData();
    console.log();
    const fileFields = ["logo", "banner", "favicon", "background"];
    fileFields.forEach(field => {
      const file = formData.get(field);
      if (file && typeof file !== "string") {
        uploadForm.append(field, file);
      }
    });

    console.log("Token", token);
    console.log("Company ID:", companyId);
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
    console.error("Erro no PATCH /company/design/images:", error);
    return NextResponse.json(
      { error: "Erro interno ao enviar imagens" },
      { status: 500 }
    );
  }
});
