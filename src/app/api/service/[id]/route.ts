import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const PATCH = auth(async function PATCH(req, { params }) {
  const token = req.auth?.accessToken;

  if (!token) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const serviceId = params?.id;
    const body = await req.json();

    const requestBody = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      duration: Number(body.duration),
    };

    const updatedService = await fetchFromBackend(
      req,
      `/service/${serviceId}`,
      token,
      {
        method: "PATCH",
        body: requestBody,
      }
    );

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao editar serviço:", error);
    return NextResponse.json(
      { message: "Erro interno ao editar o serviço." },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, { params }) {
  const token = req.auth?.accessToken;
  const serviceId = params?.id;

  if (!token) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  if (!serviceId) {
    return NextResponse.json(
      { message: "ID do serviço não informado." },
      { status: 400 }
    );
  }

  try {
    const res = await fetchFromBackend(req, `/service/${serviceId}`, token, {
      method: "DELETE",
    });

    return NextResponse.json(
      { message: "Serviço deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erro interno ao deletar serviço:", error);
    return NextResponse.json(
      { message: "Erro interno ao deletar o serviço." },
      { status: 500 }
    );
  }
});

