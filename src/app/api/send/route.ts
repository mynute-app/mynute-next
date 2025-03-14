import { EmailTemplate } from "../../../components/custom/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { fullName, email, phone } = await req.json();

    console.log("📥 Recebendo dados do frontend:", { fullName, email, phone });

    if (!fullName || !email || !phone) {
      console.error("❌ Dados inválidos recebidos!", {
        fullName,
        email,
        phone,
      });
      return Response.json(
        { error: "Nome, e-mail e telefone são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["vitoraugusto2010201078@gmail.com"], // 📩 Agora o destinatário é fixo!
      subject: "Confirmação de Agendamento",
      react: EmailTemplate({ fullName, email, phone }),
    });

    if (error) {
      console.error("❌ Erro ao enviar e-mail via Resend:", error);
      return Response.json({ error }, { status: 500 });
    }

    console.log("✅ E-mail enviado com sucesso!", data);
    return Response.json(data);
  } catch (error) {
    console.error("❌ Erro inesperado no servidor:", error);
    return Response.json({ error }, { status: 500 });
  }
}
