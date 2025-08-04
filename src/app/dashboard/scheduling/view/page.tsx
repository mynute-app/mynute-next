import React from "react";
import { CalendarView } from "./_components/calendar-view";

export default function ViewSchedulingPage() {
  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex flex-col gap-4 pb-20">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visualizar Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize todos os agendamentos da sua empresa
          </p>
        </div>

        <div className="flex-1 min-h-[600px] rounded-xl border bg-background ">
          <CalendarView />
        </div>
      </div>
    </div>
  );
}
