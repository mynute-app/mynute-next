import { ForgotPasswordEmailTemplate } from "@/components/custom/forgot-password-email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Primeiro, buscar informações da empresa pelo subdomínio
    const companyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/company/subdomain/${subdomain}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
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

    // Chamar a API do backend para resetar a senha
    const resetResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/employee/reset-password/${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company.id.toString(),
        },
      }
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

    const resetData = await resetResponse.json();
    console.log("✅ Senha resetada com sucesso");

    // Buscar informações do funcionário para personalizar o email
    const employeeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/employee/email/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company.id.toString(),
        },
      }
    );

    let employeeName = "Funcionário";
    if (employeeResponse.ok) {
      const employee = await employeeResponse.json();
      employeeName = employee.name || "Funcionário";
    }

    // Enviar email com a nova senha
    const { data, error } = await resend.emails.send({
      from: "Agenda Kaki <onboarding@resend.dev>",
      to: ["vitoraugusto2010201078@gmail.com"], // Em DEV sempre para seu email
      subject: `🔐 [DEV] Nova senha temporária para ${employeeName} (${email})`,
      react: ForgotPasswordEmailTemplate({
        employeeName,
        companyName: company.trading_name || company.legal_name,
        email,
        newPassword: resetData.password,
      }),
    });

    if (error) {
      console.error("❌ Erro ao enviar e-mail via Resend:", error);
      return Response.json({ error: "Erro ao enviar e-mail" }, { status: 500 });
    }

    console.log("✅ [DEV] E-mail de reset de senha enviado com sucesso!", data);
    return Response.json({
      success: true,
      message: "Nova senha enviada por e-mail",
      data,
    });
  } catch (error) {
    console.error("❌ Erro inesperado ao processar reset de senha:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
