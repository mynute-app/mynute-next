import { NextRequest, NextResponse } from "next/server";
import { resolveTenantSlugFromRequest } from "@/lib/tenant";
import { getCompanyByTenantSlug } from "@/lib/tenant-company";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email e codigo sao obrigatorios" },
        { status: 400 },
      );
    }

    const tenantFromBody = typeof body?.tenant === "string" ? body.tenant : null;
    const tenant = resolveTenantSlugFromRequest(req, tenantFromBody);

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

    const response = await fetch(`${process.env.BACKEND_URL}/employee/login-with-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Company-ID": company.id,
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao fazer login com codigo:", errorText);

      return NextResponse.json(
        {
          error: "Codigo invalido ou expirado",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const token = response.headers.get("X-Auth-Token");

    if (!token) {
      return NextResponse.json(
        { error: "Token nao encontrado na resposta" },
        { status: 500 },
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        token,
        companyId: company.id,
        tenant,
        subdomain: tenant,
        email,
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao processar login com codigo:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao processar login",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
