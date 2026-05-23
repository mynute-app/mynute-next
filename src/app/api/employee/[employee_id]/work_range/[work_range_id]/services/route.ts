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

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "POST",
        body: body,
      },
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
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

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "GET",
      },
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
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

    return NextResponse.json(responseData, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
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

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "DELETE",
      },
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
});
