import { google } from "googleapis";
import { NextResponse } from "next/server";

if (
  !process.env.SERVICE_ACCOUNT_PRIVATE_KEY ||
  !process.env.SERVICE_ACCOUNT_EMAIL
) {
  throw new Error(
    "As variáveis de ambiente para a Service Account não estão configuradas."
  );
}

const auth = new google.auth.JWT({
  email: process.env.SERVICE_ACCOUNT_EMAIL,
  key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const calendarId = searchParams.get("calendarId") || "primary";
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const busySlots =
      response.data.items?.map(event => ({
        start: event.start?.dateTime,
        end: event.end?.dateTime,
      })) || [];

    return NextResponse.json(busySlots);
  } catch (error) {
    console.error("Erro ao buscar horários ocupados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar horários ocupados" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { summary, description, start, end } = body;

    if (!summary || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: summary, start, or end" },
        { status: 400 }
      );
    }

    const event = {
      summary,
      description: description || "",
      start: {
        dateTime: start,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: end,
        timeZone: "America/Sao_Paulo",
      }, // Adicione e-mails dinâmicos aqui
    };

    const response = await calendar.events.insert({
      calendarId: "vitoraugusto2010201078@gmail.com", // Substitua pelo ID do seu calendário
      requestBody: event,
    });

    return NextResponse.json(
      { message: "Evento criado com sucesso!", event: response.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: "Erro ao criar evento", details: error },
      { status: 500 }
    );
  }
}
