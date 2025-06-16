import { WelcomeCompanyEmailTemplate } from "../../../../components/custom/welcome-company-email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { ownerName, companyName, email, subdomain } = await req.json();

    console.log("📥 Enviando email de boas-vindas para DEV:", {
      ownerName,
      companyName,
      email,
      subdomain,
    });

    if (!ownerName || !companyName || !email || !subdomain) {
      console.error("❌ Dados inválidos para envio de email de boas-vindas!", {
        ownerName,
        companyName,
        email,
        subdomain,
      });
      return Response.json(
        {
          error:
            "Todos os campos são obrigatórios para envio do email de boas-vindas.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Agenda Kaki <onboarding@resend.dev>",
      to: ["vitoraugusto2010201078@gmail.com"],
      subject: `📨 [DEV] Simulando boas-vindas para ${ownerName} (${email})`,
      react: WelcomeCompanyEmailTemplate({
        ownerName,
        companyName,
        email,
        subdomain,
      }),
    });

    if (error) {
      console.error(
        "❌ Erro ao enviar e-mail de boas-vindas via Resend:",
        error
      );
      return Response.json({ error }, { status: 500 });
    }

    console.log("✅ [DEV] E-mail simulado com sucesso!", data);
    return Response.json({
      success: true,
      message: "Email de boas-vindas (dev) enviado com sucesso",
      data,
    });
  } catch (error) {
    console.error("❌ Erro inesperado ao enviar email de boas-vindas:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
