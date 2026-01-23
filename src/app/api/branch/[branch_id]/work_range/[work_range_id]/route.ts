import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, work_range_id } = (await ctx.params) as {
      branch_id: string;
      work_range_id: string;
    };

    console.log("🔍 GET Branch ID:", branch_id);
    console.log("🔍 GET Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_range/${work_range_id}`,
      token,
      {
        method: "GET",
      }
    );

    console.log("✅ Sucesso com GET (work_range):", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});

export const PUT = auth(async function PUT(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, work_range_id } = (await ctx.params) as {
      branch_id: string;
      work_range_id: string;
    };

    const body = await req.json();

    console.log(
      "📦 Body recebido (PUT work_range):",
      JSON.stringify(body, null, 2)
    );
    console.log("🔍 PUT Branch ID:", branch_id);
    console.log("🔍 PUT Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_range/${work_range_id}`,
      token,
      {
        method: "PUT",
        body: body,
      }
    );

    console.log("✅ Sucesso com PUT (work_range):", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao atualizar work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, work_range_id } = (await ctx.params) as {
      branch_id: string;
      work_range_id: string;
    };

    console.log("🔍 DELETE Branch ID:", branch_id);
    console.log("🔍 DELETE Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_range/${work_range_id}`,
      token,
      {
        method: "DELETE",
      }
    );

    console.log("✅ Sucesso com DELETE (work_range):", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao deletar work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});

