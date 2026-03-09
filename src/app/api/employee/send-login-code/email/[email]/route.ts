import { NextRequest, NextResponse } from "next/server";
import { resolveTenantSlugFromRequest } from "@/lib/tenant";
import { getCompanyByTenantSlug } from "@/lib/tenant-company";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    const { email } = await params;

    if (!email) {
      return NextResponse.json({ error: "Email e obrigatorio" }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email);
    const tenantFromQuery = req.nextUrl.searchParams.get("tenant");
    const tenant = resolveTenantSlugFromRequest(req, tenantFromQuery);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant nao identificado" }, { status: 400 });
    }

    const companyLookup = await getCompanyByTenantSlug(tenant);

    if (!companyLookup.success) {
      return NextResponse.json(
        { error: "Empresa nao encontrada para o tenant informado" },
        { status: 404 },
      );
    }

    const company = companyLookup.company;

    const response = await fetch(
      `${process.env.BACKEND_URL}/employee/send-login-code/email/${decodedEmail}?language=pt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company.id,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao enviar codigo:", errorText);

      return NextResponse.json(
        {
          error: "Erro ao enviar codigo de verificacao",
          details: errorText,
        },
        { status: response.status },
      );
    }

    let data = null;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.log("Resposta nao JSON valida, mas codigo enviado com sucesso");
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Codigo de verificacao enviado com sucesso",
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao processar envio de codigo:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao enviar codigo de verificacao",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
