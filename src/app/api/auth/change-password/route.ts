import { resolveTenantSlugFromRequest } from "@/lib/tenant";
import { getCompanyByTenantSlug } from "@/lib/tenant-company";

const parseJwtPayload = (token: string) => {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return parsed?.data ?? null;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, currentPassword, newPassword, confirmPassword } = body;

    const tenantFromBody =
      typeof body?.tenant === "string"
        ? body.tenant
        : typeof body?.subdomain === "string"
          ? body.subdomain
          : null;

    const tenant = resolveTenantSlugFromRequest(req, tenantFromBody);

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return Response.json(
        { error: "Preencha todos os campos obrigatorios." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json({ error: "As senhas nao conferem." }, { status: 400 });
    }

    if (!tenant) {
      return Response.json({ error: "Tenant nao identificado." }, { status: 400 });
    }

    const companyLookup = await getCompanyByTenantSlug(tenant);

    if (!companyLookup.success) {
      return Response.json(
        { error: "Empresa nao encontrada para o tenant informado." },
        { status: 404 },
      );
    }

    const company = companyLookup.company;

    const loginResponse = await fetch(`${process.env.BACKEND_URL}/employee/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Company-ID": company.id.toString(),
      },
      body: JSON.stringify({
        email,
        password: currentPassword,
      }),
    });

    if (!loginResponse.ok) {
      return Response.json(
        { error: "Senha temporaria invalida ou expirada." },
        { status: 401 },
      );
    }

    const authToken = loginResponse.headers.get("X-Auth-Token");
    if (!authToken) {
      return Response.json(
        { error: "Token de autenticacao nao encontrado." },
        { status: 500 },
      );
    }

    const userData = parseJwtPayload(authToken);
    const employeeId = userData?.id;

    if (!employeeId) {
      return Response.json(
        { error: "Nao foi possivel identificar o usuario." },
        { status: 500 },
      );
    }

    const updateResponse = await fetch(`${process.env.BACKEND_URL}/employee/${employeeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": authToken,
        "X-Company-ID": company.id.toString(),
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    if (!updateResponse.ok) {
      const errorBody = await updateResponse.text();
      return Response.json(
        {
          error: errorBody || "Nao foi possivel atualizar a senha. Tente novamente.",
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      message: "Senha atualizada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return Response.json(
      { error: "Erro interno ao atualizar a senha." },
      { status: 500 },
    );
  }
}
