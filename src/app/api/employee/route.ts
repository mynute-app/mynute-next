import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

const normalizeEmployee = (employee: Record<string, any>) => ({
  id: employee?.id,
  company_id: employee?.company_id,
  name: employee?.name || "",
  surname: employee?.surname || "",
  time_zone: employee?.time_zone || "America/Sao_Paulo",
  total_service_density: employee?.total_service_density ?? 0,
  is_active: employee?.is_active ?? true,
  verified: employee?.verified ?? false,
  email: employee?.email || "",
  phone: employee?.phone || "",
  role: employee?.role || employee?.permission || "Profissional",
  permission: employee?.permission || employee?.role || "",
  description: employee?.description || employee?.bio || "",
  work_schedule: Array.isArray(employee?.work_schedule)
    ? employee.work_schedule
    : [],
  branches: Array.isArray(employee?.branches) ? employee.branches : [],
  services: Array.isArray(employee?.services) ? employee.services : [],
});

const normalizeEmployeeListResponse = (payload: Record<string, any>) => {
  const employees = Array.isArray(payload?.employees)
    ? payload.employees.map((employee: Record<string, any>) =>
        normalizeEmployee(employee),
      )
    : [];

  return {
    employees,
    total: Number(payload?.total ?? employees.length),
    page: Number(payload?.page ?? 1),
    page_size: Number(payload?.page_size ?? employees.length),
  };
};

const parseBackendError = (error: unknown) => {
  const fallback = {
    status: 500,
    body: {
      message: "Erro interno ao buscar funcionarios.",
      error: error instanceof Error ? error.message : String(error),
    },
  };

  if (!(error instanceof Error)) {
    return fallback;
  }

  const match = error.message.match(
    /^Erro ao acessar backend \((\d+)\):\s*(.*)$/,
  );
  if (!match) {
    return fallback;
  }

  const status = Number(match[1]);
  const payloadText = match[2]?.trim();

  if (!payloadText) {
    return {
      status: Number.isFinite(status) ? status : 500,
      body: {
        message: "Erro ao buscar funcionarios.",
      },
    };
  }

  try {
    return {
      status: Number.isFinite(status) ? status : 500,
      body: JSON.parse(payloadText),
    };
  } catch {
    return {
      status: Number.isFinite(status) ? status : 500,
      body: {
        message: payloadText,
      },
    };
  }
};

export const GET = auth(async function GET(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    if (!authData.companyId) {
      return NextResponse.json(
        { message: "Company ID não encontrado no token" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    const employeeList = await fetchFromBackend(
      req,
      "/employee",
      authData.token!,
      {
        method: "GET",
        queryParams: {
          page,
          page_size: pageSize,
        },
        headers: {
          // Keep explicit to match backend contract from swagger.
          "X-Company-ID": authData.companyId,
        },
      },
    );

    return NextResponse.json(
      normalizeEmployeeListResponse(employeeList as Record<string, any>),
      { status: 200 },
    );
  } catch (error) {
    const parsed = parseBackendError(error);
    return NextResponse.json(parsed.body, { status: parsed.status });
  }
});

export const POST = auth(async function POST(req) {
  try {
    const token = req.auth?.accessToken;
    const email = req.auth?.user.email;

    if (!token || !email) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const user = await fetchFromBackend(req, `/employee/email/${email}`, token);

    const companyId = user?.company_id;
    if (!companyId) {
      return NextResponse.json(
        { message: "Usuário sem empresa associada" },
        { status: 400 },
      );
    }

    const requestBody = {
      company_id: companyId,
      name: body.name,
      surname: body.surname,
      email: body.email,
      phone: body.phone,
      password: body.password,
      role: "user",
      time_zone: body.timezone,
    };

    console.log("🔍 API - Request body being sent to backend:", requestBody);

    // Usando fetchFromBackend para criar o funcionário
    const createdEmployee = await fetchFromBackend(req, "/employee", token, {
      method: "POST",
      body: requestBody,
    });

    console.log("✅ Funcionário criado com sucesso:", createdEmployee);

    revalidateTag("company", "max");

    return NextResponse.json(createdEmployee, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar o funcionário" },
      { status: 500 },
    );
  }
});
