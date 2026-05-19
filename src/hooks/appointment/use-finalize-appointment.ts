import { useState } from "react";
import type {
  FinalizeAppointmentRequest,
  FinalizeAppointmentResponse,
} from "../../../types/inventory";

export function useFinalizeAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalizeAppointment = async (
    appointmentId: string,
    body: FinalizeAppointmentRequest,
  ): Promise<FinalizeAppointmentResponse> => {
    setLoading(true);
    setError(null);

    // Track error message locally so the catch block doesn't overwrite it
    // when the throw comes from the !res.ok branch.
    let errorMsg: string | null = null;

    try {
      const res = await fetch(`/api/appointment/${appointmentId}/finalize`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json();
        errorMsg = errData.message || "Erro ao finalizar agendamento";
        setError(errorMsg);
        throw new Error(errorMsg ?? "Erro ao finalizar agendamento");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      if (errorMsg === null) {
        // Unexpected error (e.g. network failure) — not set from !res.ok path
        errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { finalizeAppointment, loading, error };
}
