import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Tipos baseados na especificação da API
export interface WorkScheduleRange {
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
      setWorkScheduleData(ranges);

      return ranges;
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

  const reset = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    createWorkSchedule,
    fetchWorkSchedule,
    workScheduleData,
    loading,
    fetchLoading,
    success,
    error,
    reset,
  };
};
