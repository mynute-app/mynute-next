import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  event?: any;
  error?: string;
};

export default async function googleCalendarHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: `O método ${req.method} não é permitido.` });
  }

  const { accessToken, dateTimeStart, dateTimeEnd, summary, description } =
    req.body;

  if (!accessToken || !dateTimeStart || !dateTimeEnd) {
    return res.status(400).json({
      error:
        "Parâmetros obrigatórios ausentes: accessToken, dateTimeStart, dateTimeEnd.",
    });
  }

  try {
    // Configurar o cliente OAuth2
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Instanciar a API do Google Calendar
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Criar o evento no Google Calendar
    const event = {
      summary: summary || "Novo Evento",
      description: description || "Criado pelo app Next.js",
      start: {
        dateTime: dateTimeStart,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: dateTimeEnd,
        timeZone: "America/Sao_Paulo",
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.status(200).json({ event: response.data });
  } catch (error: any) {
    console.error("Erro ao criar evento:", error.message);
    res.status(500).json({ error: error.message });
  }
}
