import { useState } from "react";

interface UpdateAppointmentPayload {
  employee_id: string;
  start_time: string;
  end_time: string;
}

export function useUpdateAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAppointment = async (
    appointmentId: string,
    payload: UpdateAppointmentPayload,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointment/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar agendamento");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAppointment, loading, error };
}
