import { resolveTenantSlugFromRequest } from "@/lib/tenant";
import { getCompanyByTenantSlug } from "@/lib/tenant-company";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const tenantFromBody =
      typeof body?.tenant === "string"
        ? body.tenant
        : typeof body?.subdomain === "string"
          ? body.subdomain
          : null;

    const tenant = resolveTenantSlugFromRequest(req, tenantFromBody);

    if (!email || !tenant) {
      return Response.json(
        {
          error: "E-mail e tenant sao obrigatorios.",
        },
        { status: 400 },
      );
    }

    const companyLookup = await getCompanyByTenantSlug(tenant);

    if (!companyLookup.success) {
      return Response.json({ error: "Empresa nao encontrada" }, { status: 404 });
    }

    const company = companyLookup.company;

    const resetResponse = await fetch(
      `${process.env.BACKEND_URL}/employee/reset-password/${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company.id.toString(),
        },
      },
    );

    if (!resetResponse.ok) {
      const errorData = await resetResponse.text();
      console.error("Erro ao resetar senha no backend:", errorData);

      if (resetResponse.status === 404) {
        return Response.json(
          { error: "Funcionario nao encontrado com este e-mail" },
          { status: 404 },
        );
      }

      return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
    }

    const rawBody = await resetResponse.text();
    let resetData: { password?: string } | null = null;
    if (rawBody) {
      try {
        resetData = JSON.parse(rawBody) as { password?: string };
      } catch {
        console.warn("Resposta nao JSON ao resetar senha:", rawBody);
      }
    }

    return Response.json({
      success: true,
      message: "Nova senha gerada com sucesso",
      password: resetData?.password,
    });
  } catch (error) {
    console.error("Erro inesperado ao processar reset de senha:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
