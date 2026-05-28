"use client";

/**
 * Dev-preview wrapper for the client appointments list.
 *
 * AppointmentsList receives its data via props (not via fetch), so it cannot
 * participate in the MSW mock system directly. This wrapper reads the ?state
 * search param from the URL and passes the appropriate mock data as props.
 *
 * States:
 *  - populated  → renders 3 mock appointments (upcoming, past, cancelled)
 *  - empty      → renders empty list (shows "Nenhum agendamento encontrado")
 *  - error      → same as empty (component has no error boundary)
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppointmentsList from "@/app/client/agendamentos/_components/AppointmentsList";
import { mockClientAppointments } from "@/mocks/data";

function ClientAgendamentosContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state") ?? "populated";

  const appointments = state === "populated" ? mockClientAppointments : [];
  const totalCount = appointments.length;

  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meus Agendamentos</h1>
      <AppointmentsList initialAppointments={appointments} totalCount={totalCount} />
    </div>
  );
}

export default function ClientAgendamentosPreview() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
      <ClientAgendamentosContent />
    </Suspense>
  );
}
