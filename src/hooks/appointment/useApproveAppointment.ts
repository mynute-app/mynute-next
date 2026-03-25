import { useState } from "react";

export function useApproveAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveAppointment = async (appointmentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/appointment/${appointmentId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao aprovar agendamento");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { approveAppointment, loading, error };
}
