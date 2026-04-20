import { NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, work_range_id } = (await ctx.params) as {
      employee_id: string;
      work_range_id: string;
    };

    const body = await req.json();

    console.log(
      "📦 Body recebido (POST employee work_range services):",
      JSON.stringify(body, null, 2),
    );
    console.log("🔍 POST Employee ID:", employee_id);
    console.log("🔍 POST Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "POST",
        body: body,
      },
    );

    console.log(
      "✅ Sucesso com POST (employee work_range services):",
      responseData,
    );
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao adicionar services ao work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
});

export const GET = auth(async function GET(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, work_range_id } = (await ctx.params) as {
      employee_id: string;
      work_range_id: string;
    };

    console.log("🔍 GET Employee ID:", employee_id);
    console.log("🔍 GET Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "GET",
      },
    );

    console.log(
      "✅ Sucesso com GET (employee work_range services):",
      responseData,
    );
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar services do work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
});

export const PUT = auth(async function PUT(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, work_range_id } = (await ctx.params) as {
      employee_id: string;
      work_range_id: string;
    };

    const body = await req.json();

    console.log(
      "📦 Body recebido (PUT employee work_range services):",
      JSON.stringify(body, null, 2),
    );
    console.log("🔍 PUT Employee ID:", employee_id);
    console.log("🔍 PUT Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        // Backend does not support PUT for this endpoint (405). Keep PUT in
        // frontend proxy for compatibility but forward as POST.
        method: "POST",
        body: body,
      },
    );

    console.log(
      "✅ Sucesso com PUT (employee work_range services):",
      responseData,
    );
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao atualizar services do work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id, work_range_id } = (await ctx.params) as {
      employee_id: string;
      work_range_id: string;
    };

    console.log("🔍 DELETE Employee ID:", employee_id);
    console.log("🔍 DELETE Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "DELETE",
      },
    );

    console.log(
      "✅ Sucesso com DELETE (employee work_range services):",
      responseData,
    );
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao remover services do work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
});
