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

    console.log(
      "🔍 Hook - Buscando work_schedule para employeeId:",
      employeeId
    );

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
      console.log("📋 Hook - Dados recebidos:", result);

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

      console.error("❌ Hook - Erro ao buscar work_schedule:", err);

      // Não mostrar toast para erro de busca, deixar o componente decidir
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

    console.log(
      "🚀 Hook - Iniciando createWorkSchedule para employeeId:",
      employeeId
    );
    console.log(
      "📋 Hook - WorkScheduleData:",
      JSON.stringify(workScheduleData, null, 2)
    );

    try {
      const payload = {
        work_schedule: workScheduleData,
      };

      console.log(
        "📤 Hook - Payload que será enviado:",
        JSON.stringify(payload, null, 2)
      );

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

    console.log(
      "➕ Hook - Iniciando addWorkScheduleRanges para employeeId:",
      employeeId
    );
    console.log(
      "📋 Hook - Novos ranges para adicionar:",
      JSON.stringify(newRanges, null, 2)
    );

    try {
      // 1. Filtrar apenas os ranges novos (sem ID)
      const rangesWithoutId = newRanges.filter(range => !range.id);

      console.log("� Hook - Ranges novos (sem ID):", rangesWithoutId);

      if (rangesWithoutId.length === 0) {
        console.log("ℹ️ Hook - Nenhum range novo para adicionar");
        toast({
          title: "Nenhum horário novo",
          description: "Todos os horários já existem.",
        });
        return;
      }

      // 2. Enviar apenas os novos ranges
      const payload = {
        work_schedule: {
          employee_work_ranges: rangesWithoutId,
        },
      };

      console.log(
        "📤 Hook - Payload apenas com novos ranges:",
        JSON.stringify(payload, null, 2)
      );

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
