import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromToken } from "../../../../utils/decode-jwt";

export const GET = auth(async function GET(req, { params }) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Usar o utilitário para decodificar o token
    const authData = getAuthDataFromToken(token);

    if (!authData.isValid) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const serviceId = params?.id;

    if (!serviceId) {
      return NextResponse.json(
        { message: "ID do serviço não informado." },
        { status: 400 }
      );
    }

    try {
      const service = await fetchFromBackend(
        req,
        `/service/${serviceId}`,
        token,
        {
          method: "GET",
        }
      );

      return NextResponse.json(service, { status: 200 });
    } catch (fetchError) {
      console.error("❌ Erro ao buscar serviço:", fetchError);
      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao buscar serviço",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
});


export const PATCH = auth(async function PATCH(req, { params }) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Usar o utilitário para decodificar o token
    const authData = getAuthDataFromToken(token);

    if (!authData.isValid) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const serviceId = params?.id;
    const body = await req.json();

    const requestBody = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      duration: Number(body.duration),
    };

    try {
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
    } catch (fetchError) {
      console.error("❌ Erro ao editar serviço:", fetchError);
      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao editar serviço",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
});

export const DELETE = auth(async function DELETE(req, { params }) {
  try {
    const token = req.auth?.accessToken;
    const serviceId = params?.id;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // Usar o utilitário para decodificar o token
    const authData = getAuthDataFromToken(token);

    if (!authData.isValid) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    if (!serviceId) {
      return NextResponse.json(
        { message: "ID do serviço não informado." },
        { status: 400 }
      );
    }

    try {
      await fetchFromBackend(req, `/service/${serviceId}`, token, {
        method: "DELETE",
      });

      return NextResponse.json(
        { message: "Serviço deletado com sucesso" },
        { status: 200 }
      );
    } catch (fetchError) {
      console.error("❌ Erro ao deletar serviço:", fetchError);
      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao deletar serviço",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
});
