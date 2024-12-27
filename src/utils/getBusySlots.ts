import { google } from "googleapis";

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

// Função para buscar horários ocupados no Google Calendar
export async function getBusySlots(
  calendarId: string,
  timeMin: string,
  timeMax: string
) {
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

    return busySlots;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw new Error("Não foi possível buscar os eventos do Google Calendar.");
  }
}

