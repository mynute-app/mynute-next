import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Tipos baseados na especificação da API
export interface WorkScheduleRange {
  id?: string; // ID vem do backend após criação
  branch_id: string;
  employee_id: string;
  end_time: string;
  services: Array<{ id?: string; [key: string]: any }>;
  start_time: string;
  time_zone: string;
  weekday: number;
}

export interface WorkScheduleData {
  employee_work_ranges: WorkScheduleRange[];
}

interface UseWorkScheduleProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  employeeId?: string;
}

export const useWorkSchedule = (props?: UseWorkScheduleProps) => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workScheduleData, setWorkScheduleData] = useState<WorkScheduleRange[]>(
    []
  );
  const { toast } = useToast();

  // Função para normalizar dados do backend
  const normalizeWorkScheduleData = (ranges: any[]): WorkScheduleRange[] => {
    return ranges.map(range => ({
      id: range.id,
      branch_id: range.branch_id,
      employee_id: range.employee_id,
      // Converter timestamps para formato HH:MM
      start_time: range.start_time.includes("T")
        ? new Date(range.start_time).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: range.time_zone || "America/Sao_Paulo",
          })
        : range.start_time,
      end_time: range.end_time.includes("T")
        ? new Date(range.end_time).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: range.time_zone || "America/Sao_Paulo",
          })
        : range.end_time,
      time_zone: range.time_zone,
      weekday: range.weekday,
      services: range.services || [],
    }));
  };

  // Buscar dados automaticamente se autoFetch estiver habilitado e employeeId fornecido
  useEffect(() => {
    if (props?.autoFetch && props?.employeeId) {
      fetchWorkSchedule(props.employeeId);
    }
  }, [props?.autoFetch, props?.employeeId]);

  const fetchWorkSchedule = async (employeeId: string) => {
    setFetchLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/work_schedule`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao buscar horário de trabalho"
        );
      }

      const result = await response.json();

      // Normalizar dados se necessário
      const ranges =
        result.employee_work_ranges || result.data?.employee_work_ranges || [];

      // Normalizar os dados vindos do backend
      const normalizedRanges = normalizeWorkScheduleData(ranges);
      setWorkScheduleData(normalizedRanges);

      return normalizedRanges;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setFetchLoading(false);
    }
  };

  const createWorkSchedule = async (
    employeeId: string,
    workScheduleData: WorkScheduleData
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const payload = {
        work_schedule: workScheduleData,
      };

      const response = await fetch(
        `/api/employee/${employeeId}/work_schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao criar horário de trabalho"
        );
      }

      const result = await response.json();

      setSuccess(true);

      toast({
        title: "Horário de trabalho criado!",
        description: "O horário de trabalho foi configurado com sucesso.",
      });

      // Recarregar dados após sucesso
      if (props?.autoFetch) {
        await fetchWorkSchedule(employeeId);
      }

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao configurar horário",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Nova função para adicionar horários sem sobrescrever existentes
  const addWorkScheduleRanges = async (
    employeeId: string,
    newRanges: WorkScheduleRange[]
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const rangesWithoutId = newRanges.filter(range => !range.id);

      if (rangesWithoutId.length === 0) {
        toast({
          title: "Nenhum horário novo",
          description: "Todos os horários já existem.",
        });
        return;
      }

      let existingRanges: WorkScheduleRange[] = [];
      try {
        existingRanges = await fetchWorkSchedule(employeeId);
      } catch (error) {
        existingRanges = [];
      }

      // 3. Validar sobreposição de horários no mesmo dia
      for (const newRange of rangesWithoutId) {
        const existingInSameDay = existingRanges.filter(
          existing => existing.weekday === newRange.weekday
        );

        for (const existing of existingInSameDay) {
          const newStart = parseInt(newRange.start_time.replace(":", ""));
          const newEnd = parseInt(newRange.end_time.replace(":", ""));
          const existingStart = parseInt(existing.start_time.replace(":", ""));
          const existingEnd = parseInt(existing.end_time.replace(":", ""));

          // Verificar sobreposição
          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            const dayNames: { [key: number]: string } = {
              0: "Domingo",
              1: "Segunda",
              2: "Terça",
              3: "Quarta",
              4: "Quinta",
              5: "Sexta",
              6: "Sábado",
            };

            throw new Error(
              `Conflito de horários na ${dayNames[newRange.weekday]}! ` +
                `O horário ${newRange.start_time}-${newRange.end_time} sobrepõe com ` +
                `o horário existente ${existing.start_time}-${existing.end_time}. ` +
                `Um funcionário não pode ter horários sobrepostos no mesmo dia.`
            );
          }
        }
      }

      const payload = {
        work_schedule: {
          employee_work_ranges: rangesWithoutId,
        },
      };

      const response = await fetch(
        `/api/employee/${employeeId}/work_schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao adicionar horários de trabalho"
        );
      }

      const result = await response.json();

      setSuccess(true);

      toast({
        title: "Horários adicionados!",
        description: "Os novos horários foram adicionados com sucesso.",
      });

      // Recarregar dados após sucesso
      if (props?.autoFetch) {
        await fetchWorkSchedule(employeeId);
      }

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao adicionar horários",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    createWorkSchedule,
    addWorkScheduleRanges,
    fetchWorkSchedule,
    workScheduleData,
    loading,
    fetchLoading,
    success,
    error,
    reset,
  };
};
