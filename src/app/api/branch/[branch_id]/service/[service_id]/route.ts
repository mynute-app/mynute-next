import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

const resolveSchemaFromHost = (req: Request) => {
  const hostHeader = req.headers.get("host") || "";
  const host = hostHeader.split(":")[0];
  const subdomain = host.split(".")[0];
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (!subdomain || subdomain === "localhost" || isIpHost) {
    return null;
  }
  return subdomain;
};

const fetchBranchServiceWithFallback = async (
  req: Parameters<typeof fetchFromBackend>[0],
  branchId: string,
  serviceId: string,
  token: string,
  companyId: string | null,
  schemaName: string | null,
  method: "POST" | "DELETE"
) => {
  try {
    return await fetchFromBackend(
      req,
      `/branch/${branchId}/service/${serviceId}`,
      token,
      { method }
    );
  } catch (error) {
    if (!companyId) {
      throw error;
    }

    return await fetchFromBackend(
      req,
      `/branch/${branchId}/service/${serviceId}`,
      token,
      {
        method,
        skipCompanyContext: true,
        headers: {
          "X-Company-ID": companyId,
          ...(schemaName ? { "X-Company-Schema": schemaName } : {}),
        },
      }
    );
  }
};

export const POST = auth(async function POST(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token invalido" },
        { status: 401 }
      );
    }

    const { branch_id, service_id } = ctx.params as {
      branch_id: string;
      service_id: string;
    };

    const schemaName = resolveSchemaFromHost(req);
    const responseData = await fetchBranchServiceWithFallback(
      req,
      branch_id,
      service_id,
      authData.token!,
      authData.companyId,
      schemaName,
      "POST"
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Erro ao vincular servico:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao vincular o servico a filial",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token invalido" },
        { status: 401 }
      );
    }

    const { branch_id, service_id } = ctx.params as {
      branch_id: string;
      service_id: string;
    };

    const schemaName = resolveSchemaFromHost(req);
    await fetchBranchServiceWithFallback(
      req,
      branch_id,
      service_id,
      authData.token!,
      authData.companyId,
      schemaName,
      "DELETE"
    );

    return NextResponse.json(
      { message: "Servico desvinculado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao desvincular servico:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao desvincular o servico da filial",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
