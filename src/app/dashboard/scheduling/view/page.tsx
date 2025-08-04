import React from "react";
import { CalendarView } from "./_components/calendar-view";

export default function ViewSchedulingPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visualizar Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize todos os agendamentos da sua empresa
          </p>
        </div>

        <div className="min-h-[600px] flex-1 rounded-xl border bg-background">
          <CalendarView />
        </div>
      </div>
    </div>
  );
}
