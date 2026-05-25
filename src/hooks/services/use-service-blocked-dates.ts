import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ServiceBlockedDate {
  id: string;
  service_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceBlockedDateInput {
  start_date: string;
  end_date: string;
  reason?: string;
}

export function useServiceBlockedDates(serviceId: string | number | null) {
  const { toast } = useToast();
  const [blockedDates, setBlockedDates] = useState<ServiceBlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBlockedDates = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/service/${serviceId}/blocked-dates`);
      if (!res.ok) throw new Error("Erro ao carregar datas bloqueadas");
      const data = await res.json();
      setBlockedDates(Array.isArray(data) ? data : []);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as datas bloqueadas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [serviceId, toast]);

  const createBlockedDate = useCallback(
    async (input: CreateServiceBlockedDateInput): Promise<boolean> => {
      if (!serviceId) return false;
      setCreating(true);
      try {
        const res = await fetch(`/api/service/${serviceId}/blocked-dates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Erro ao criar data bloqueada");
        }
        const created = await res.json();
        setBlockedDates(prev => [...prev, created]);
        toast({ title: "Data bloqueada com sucesso" });
        return true;
      } catch (error) {
        toast({
          title: "Erro",
          description:
            error instanceof Error
              ? error.message
              : "Erro ao criar data bloqueada",
          variant: "destructive",
        });
        return false;
      } finally {
        setCreating(false);
      }
    },
    [serviceId, toast],
  );

  const deleteBlockedDate = useCallback(
    async (blockedDateId: string): Promise<boolean> => {
      if (!serviceId) return false;
      try {
        const res = await fetch(
          `/api/service/${serviceId}/blocked-dates/${blockedDateId}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Erro ao remover data bloqueada");
        setBlockedDates(prev => prev.filter(d => d.id !== blockedDateId));
        toast({ title: "Bloqueio removido com sucesso" });
        return true;
      } catch (error) {
        toast({
          title: "Erro",
          description:
            error instanceof Error
              ? error.message
              : "Erro ao remover data bloqueada",
          variant: "destructive",
        });
        return false;
      }
    },
    [serviceId, toast],
  );

  return {
    blockedDates,
    loading,
    creating,
    fetchBlockedDates,
    createBlockedDate,
    deleteBlockedDate,
  };
}
