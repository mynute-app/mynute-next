import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Tipos baseados na especificação da API para branch
export interface BranchWorkScheduleRange {
  branch_id: string;
  end_time: string;
  services: Array<{ id?: string; [key: string]: any }>;
  start_time: string;
  time_zone: string;
  weekday: number;
}

export interface BranchWorkScheduleData {
  branch_work_ranges: BranchWorkScheduleRange[];
}

interface UseBranchWorkScheduleProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type RequestOptions = {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
};

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const errorData = await response.json();
    if (
      typeof errorData?.message === "string" &&
      errorData.message.length > 0
    ) {
      return errorData.message;
    }
  } catch {
    // Ignore JSON parsing errors and use fallback message.
  }

  try {
    const text = await response.text();
    if (text.length > 0) return text;
  } catch {
    // Ignore text parsing errors and use fallback message.
  }

  return fallback;
};

export const useBranchWorkSchedule = (props?: UseBranchWorkScheduleProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BranchWorkScheduleRange[] | null>(null);
  const { toast } = useToast();

  const createBranchWorkSchedule = useCallback(
    async (
      branchId: string,
      workScheduleData: BranchWorkScheduleData,
      options?: RequestOptions,
    ) => {
      const showSuccessToast = options?.showSuccessToast ?? true;
      const showErrorToast = options?.showErrorToast ?? true;
      setLoading(true);
      setSuccess(false);
      setError(null);

      try {
        const payload = {
          work_schedule: workScheduleData,
        };

        const response = await fetch(`/api/branch/${branchId}/work_schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const message = await parseErrorMessage(
            response,
            "Erro ao criar horario de trabalho da filial",
          );
          throw new Error(message);
        }

        const result = await response.json();
        const ranges =
          result?.branch_work_ranges ||
          result?.data?.branch_work_ranges ||
          result?.data ||
          [];

        setSuccess(true);
        if (Array.isArray(ranges)) {
          setData(ranges);
        }

        if (showSuccessToast) {
          toast({
            title: "Horario da filial atualizado!",
            description: "Configuracao de horarios salva com sucesso.",
          });
        }

        props?.onSuccess?.();

        return result;
      } catch (err: any) {
        const errorMessage = err.message || "Erro interno do servidor";
        setError(errorMessage);

        if (showErrorToast) {
          toast({
            title: "Erro ao salvar horarios da filial",
            description: errorMessage,
            variant: "destructive",
          });
        }

        props?.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [props?.onSuccess, props?.onError, toast],
  );

  const getBranchWorkSchedule = useCallback(
    async (branchId: string, options?: RequestOptions) => {
      const showErrorToast = options?.showErrorToast ?? true;
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(`/api/branch/${branchId}/work_schedule`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const message = await parseErrorMessage(
            response,
            "Erro ao buscar horario de trabalho da filial",
          );
          throw new Error(message);
        }

        const result = await response.json();

        let workScheduleRanges = [];

        if (
          result.branch_work_ranges &&
          Array.isArray(result.branch_work_ranges)
        ) {
          workScheduleRanges = result.branch_work_ranges;
        } else if (Array.isArray(result.data)) {
          workScheduleRanges = result.data;
        } else if (Array.isArray(result)) {
          workScheduleRanges = result;
        }

        setData(workScheduleRanges);

        return workScheduleRanges;
      } catch (err: any) {
        const errorMessage = err.message || "Erro interno do servidor";
        setError(errorMessage);

        props?.onError?.(errorMessage);

        if (showErrorToast) {
          toast({
            title: "Erro ao buscar horario da filial",
            description: errorMessage,
            variant: "destructive",
          });
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [props?.onError, toast],
  );

  const reset = () => {
    setSuccess(false);
    setError(null);
    setData(null);
  };

  return {
    createBranchWorkSchedule,
    getBranchWorkSchedule,
    loading,
    success,
    error,
    data,
    reset,
  };
};
