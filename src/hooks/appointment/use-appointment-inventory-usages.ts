import { useState, useCallback } from "react";
import type { AppointmentInventoryUsage } from "../../../types/inventory";

export function useAppointmentInventoryUsages(appointmentId: string) {
  const [usages, setUsages] = useState<AppointmentInventoryUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsages = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/appointment/${appointmentId}/inventory-usages`,
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao buscar usos de inventário");
      }
      const data = await res.json();
      setUsages(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  return { usages, loading, error, fetchUsages };
}
