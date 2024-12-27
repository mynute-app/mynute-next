import React, { useState, useEffect } from "react";

const Calendar = () => {
  const [busySlots, setBusySlots] = useState<{ start: string; end: string }[]>(
    []
  );

  useEffect(() => {
    async function fetchBusySlots() {
      try {
        const timeMin = new Date().toISOString(); // Data mínima (agora)
        const timeMax = new Date(
          new Date().setMonth(new Date().getMonth() + 1)
        ).toISOString(); // 1 mês à frente

        const response = await fetch(
          `/api/calendar/busySlots?calendarId=primary&timeMin=${timeMin}&timeMax=${timeMax}`
        );
        const data = await response.json();
        setBusySlots(data);
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
      }
    }

    fetchBusySlots();
  }, []);

  return (
    <div>
      <h1>Horários Ocupados</h1>
      {busySlots.map((slot, index) => (
        <div key={index}>
          <p>Início: {new Date(slot.start).toLocaleString()}</p>
          <p>Fim: {new Date(slot.end).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Calendar;
