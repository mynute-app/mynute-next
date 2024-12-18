import { CalendarEventForm } from "../testador/CalendarEventForm";

const Page = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Criar Evento no Google Calendar</h1>
      <CalendarEventForm />
    </div>
  );
};

export default Page;
