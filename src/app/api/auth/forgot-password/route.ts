export async function POST(req: Request) {
  try {
    const { email, subdomain } = await req.json();

    console.log("📥 Solicitação de reset de senha:", {
      email,
      subdomain,
    });

    if (!email || !subdomain) {
      console.error("❌ Dados inválidos para reset de senha!", {
        email,
        subdomain,
      });
      return Response.json(
        {
          error: "E-mail e subdomínio são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const companyResponse = await fetch(
      `${process.env.BACKEND_URL}/company/subdomain/${subdomain}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!companyResponse.ok) {
      console.error("❌ Erro ao buscar empresa:", companyResponse.statusText);
      return Response.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    const company = await companyResponse.json();
    console.log(
      "✅ Empresa encontrada:",
      company.trading_name || company.legal_name
    );

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
      console.error("❌ Erro ao resetar senha no backend:", errorData);

      if (resetResponse.status === 404) {
        return Response.json(
          { error: "Funcionário não encontrado com este e-mail" },
          { status: 404 }
        );
      }

      return Response.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    const rawBody = await resetResponse.text();
    let resetData: { password?: string } | null = null;
    if (rawBody) {
      try {
        resetData = JSON.parse(rawBody) as { password?: string };
      } catch (error) {
        console.warn("⚠️ Resposta nao JSON ao resetar senha:", rawBody);
      }
    }
    console.log("✅ Senha resetada com sucesso");

    return Response.json({
      success: true,
      message: "Nova senha gerada com sucesso",
      password: resetData?.password,
    });
  } catch (error) {
    console.error("❌ Erro inesperado ao processar reset de senha:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
