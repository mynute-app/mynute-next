import { google } from "googleapis";
import { NextResponse } from "next/server";

const calendar = google.calendar("v3");

// Configurar o OAuth2 client com as credenciais
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Substitua pelas suas credenciais
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Configurar os tokens de acesso
oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Função para lidar com a rota da API
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId") || "primary";
  const timeMin = searchParams.get("timeMin");
  const timeMax = searchParams.get("timeMax");

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { message: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: calendarId,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    const busySlots = events
      .filter(event => event.start?.dateTime && event.end?.dateTime) // Filtra eventos válidos
      .map(event => ({
        start: event.start?.dateTime as string, // Garante que é uma string
        end: event.end?.dateTime as string,
      }));

    return NextResponse.json(busySlots);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar eventos do Google Calendar" },
      { status: 500 }
    );
  }
}
