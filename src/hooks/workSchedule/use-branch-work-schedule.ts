import { useState } from "react";
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

export const useBranchWorkSchedule = (props?: UseBranchWorkScheduleProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BranchWorkScheduleRange[] | null>(null);
  const { toast } = useToast();

  const createBranchWorkSchedule = async (
    branchId: string,
    workScheduleData: BranchWorkScheduleData
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "🚀 Hook Branch - Iniciando createBranchWorkSchedule para branchId:",
      branchId
    );
    console.log(
      "📋 Hook Branch - WorkScheduleData:",
      JSON.stringify(workScheduleData, null, 2)
    );

    try {
      const payload = {
        work_schedule: workScheduleData,
      };

      console.log(
        "📤 Hook Branch - Payload que será enviado:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(`/api/branch/${branchId}/work_schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao criar horário de trabalho da branch"
        );
      }

      const result = await response.json();

      setSuccess(true);

      toast({
        title: "Horário da branch criado!",
        description:
          "O horário de trabalho da filial foi configurado com sucesso.",
      });

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao configurar horário da branch",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBranchWorkSchedule = async (branchId: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    console.log(
      "📥 Hook Branch - Iniciando getBranchWorkSchedule para branchId:",
      branchId
    );

    try {
      const response = await fetch(`/api/branch/${branchId}/work_schedule`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao buscar horário de trabalho da branch"
        );
      }

      const result = await response.json();

      console.log("✅ Hook Branch - Dados recebidos:", result);

      // Normalizar os dados - o backend retorna { branch_work_ranges: [...] }
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

      console.log("📋 Hook Branch - Work schedule ranges:", workScheduleRanges);

      return workScheduleRanges;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      // Não mostrar toast para erro de "not found" - é normal não ter work_schedule
      if (
        !errorMessage.toLowerCase().includes("not found") &&
        !errorMessage.toLowerCase().includes("não encontrado")
      ) {
        toast({
          title: "Erro ao buscar horário da branch",
          description: errorMessage,
          variant: "destructive",
        });
      }

      console.warn(
        "⚠️ Hook Branch - Erro ao buscar work_schedule:",
        errorMessage
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

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
