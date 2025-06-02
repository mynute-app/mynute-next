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

    // Get form data from request
    const formData = await req.formData();
    
    // Try to get the company ID from multiple sources
    // 1. From the form data (explicitly passed)
    // 2. From the subdomain
    // 3. From the user's company association
    
    let companyId = null;
    
    // 1. Check if companyId is explicitly provided in the request
    const requestedCompanyId = formData.get('companyId');
    if (requestedCompanyId && typeof requestedCompanyId === 'string') {
      companyId = requestedCompanyId;
      console.log("Using company ID from request:", companyId);
    }
    
    // 2. If not found, try to get from subdomain
    if (!companyId) {
      const host = req.headers.get("host");
      if (host) {
        const subdomainId = await getCompanyIdFromSubdomain(host);
        if (subdomainId) {
          companyId = subdomainId;
          console.log("Using company ID from subdomain:", companyId);
        }
      }
    }
    
    // 3. If still not found, get from user's company association
    if (!companyId) {
      const user = await fetchFromBackend(req, `/employee/email/${email}`, token);
      companyId = user?.company_id;
      console.log("Using company ID from user association:", companyId);
    }

    if (!companyId) {
      return NextResponse.json(
        { message: "Não foi possível determinar a empresa" },
        { status: 400 }
      );
    }

    // Prepare the upload form
    const uploadForm = new FormData();
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
