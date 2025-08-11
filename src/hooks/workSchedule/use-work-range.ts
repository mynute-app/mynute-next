import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Tipos baseados na especificação da API para work_range individual
export interface WorkRangeData {
  id?: string;
  branch_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  time_zone: string;
  services: Array<{ id?: string; [key: string]: any }>;
}

interface UseWorkRangeProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useWorkRange = (props?: UseWorkRangeProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WorkRangeData | null>(null);
  const { toast } = useToast();

  // GET - Buscar work_range por ID
  const getWorkRange = async (branchId: string, workRangeId: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    console.log(
      "📥 Hook WorkRange - Iniciando getWorkRange para branchId:",
      branchId,
      "workRangeId:",
      workRangeId
    );

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar work_range");
      }

      const result = await response.json();

      console.log("✅ Hook WorkRange - Dados recebidos:", result);

      // Normalizar os dados se necessário
      const workRangeData = result.data || result;

      setData(workRangeData);

      console.log("📋 Hook WorkRange - Work range data:", workRangeData);

      return workRangeData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao buscar work_range",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("❌ Hook WorkRange - Erro ao buscar:", errorMessage);
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST - Criar novo work_range
  const createWorkRange = async (
    branchId: string,
    workRangeData: Partial<WorkRangeData>
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "➕ Hook WorkRange - Iniciando createWorkRange para branchId:",
      branchId
    );
    console.log(
      "📋 Hook WorkRange - Data para criar:",
      JSON.stringify(workRangeData, null, 2)
    );

    try {
      const response = await fetch(`/api/branch/${branchId}/work_range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workRangeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar work_range");
      }

      const result = await response.json();

      setSuccess(true);
      setData(result.data || result);

      toast({
        title: "Work range criado!",
        description: "O horário foi criado com sucesso.",
      });

      console.log("✅ Hook WorkRange - Criado com sucesso:", result);

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao criar work_range",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("❌ Hook WorkRange - Erro ao criar:", errorMessage);
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT - Atualizar work_range
  const updateWorkRange = async (
    branchId: string,
    workRangeId: string,
    workRangeData: Partial<WorkRangeData>
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "🔄 Hook WorkRange - Iniciando updateWorkRange para branchId:",
      branchId,
      "workRangeId:",
      workRangeId
    );
    console.log(
      "📋 Hook WorkRange - Data para atualizar:",
      JSON.stringify(workRangeData, null, 2)
    );

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workRangeData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar work_range");
      }

      const result = await response.json();

      setSuccess(true);
      setData(result.data || result);

      toast({
        title: "Work range atualizado!",
        description: "O horário foi atualizado com sucesso.",
      });

      console.log("✅ Hook WorkRange - Atualizado com sucesso:", result);

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao atualizar work_range",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("❌ Hook WorkRange - Erro ao atualizar:", errorMessage);
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Deletar work_range
  const deleteWorkRange = async (branchId: string, workRangeId: string) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "🗑️ Hook WorkRange - Iniciando deleteWorkRange para branchId:",
      branchId,
      "workRangeId:",
      workRangeId
    );

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao deletar work_range");
      }

      const result = await response.json();

      setSuccess(true);
      setData(null); // Limpar dados após deletar

      toast({
        title: "Work range deletado!",
        description: "O horário foi removido com sucesso.",
      });

      console.log("✅ Hook WorkRange - Deletado com sucesso:", result);

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao deletar work_range",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("❌ Hook WorkRange - Erro ao deletar:", errorMessage);
      props?.onError?.(errorMessage);
      throw err;
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
    // Funções
    getWorkRange,
    createWorkRange,
    updateWorkRange,
    deleteWorkRange,
    reset,

    // Estados
    loading,
    success,
    error,
    data,
  };
};
