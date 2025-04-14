import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export const PATCH = auth(async function PATCH(req, { params }) {
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const branchId = params?.id;

    const branchFetch = await fetch(
      `${process.env.BACKEND_URL}/branch/${branchId}`,
      {
        method: "GET",
        headers: {
          Authorization,
        },
      }
    );

    const branchData = await branchFetch.json();

    if (!branchFetch.ok) {
      return NextResponse.json(
        { message: "Não foi possível obter a filial", error: branchData },
        { status: branchFetch.status }
      );
    }

    const requestBody = {
      company_id: branchData.company_id,
      name: body.name,
      street: body.street,
      number: body.number,
      complement: body.complement || "",
      neighborhood: body.neighborhood || "",
      zip_code: body.zip_code,
      city: body.city,
      state: body.state,
      country: body.country,
    };

    const response = await fetch(
      `${process.env.BACKEND_URL}/branch/${branchId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error(
        "❌ Erro ao atualizar filial:",
        response.status,
        responseData
      );
      return NextResponse.json(
        { message: "Erro ao atualizar a filial", error: responseData },
        { status: response.status }
      );
    }

    console.log("✅ Filial atualizada com sucesso:", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao editar filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao editar a filial.", error },
      { status: 500 }
    );
  }
});
