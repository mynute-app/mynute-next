import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Tipos baseados na especificação da API para employee work_range individual
export interface EmployeeWorkRangeData {
  id?: string;
  employee_id: string;
  branch_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  time_zone: string;
  services: Array<{ id?: string; [key: string]: any }>;
}

interface UseEmployeeWorkRangeProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useEmployeeWorkRange = (props?: UseEmployeeWorkRangeProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EmployeeWorkRangeData | null>(null);
  const { toast } = useToast();

  // GET - Buscar employee work_range por ID
  const getEmployeeWorkRange = async (
    employeeId: string,
    workRangeId: string
  ) => {
    setLoading(true);
    setError(null);
    setData(null);

    console.log(
      "📥 Hook EmployeeWorkRange - Iniciando getEmployeeWorkRange para employeeId:",
      employeeId,
      "workRangeId:",
      workRangeId
    );

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}`,
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
          errorData.message || "Erro ao buscar employee work_range"
        );
      }

      const result = await response.json();

      console.log("✅ Hook EmployeeWorkRange - Dados recebidos:", result);

      // Normalizar os dados se necessário
      const workRangeData = result.data || result;

      setData(workRangeData);

      console.log(
        "📋 Hook EmployeeWorkRange - Work range data:",
        workRangeData
      );

      return workRangeData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao buscar work_range",
        description: errorMessage,
        variant: "destructive",
      });

      console.error(
        "❌ Hook EmployeeWorkRange - Erro ao buscar:",
        errorMessage
      );
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST - Criar novo employee work_range
  const createEmployeeWorkRange = async (
    employeeId: string,
    workRangeData: Partial<EmployeeWorkRangeData>
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "➕ Hook EmployeeWorkRange - Iniciando createEmployeeWorkRange para employeeId:",
      employeeId
    );
    console.log(
      "📋 Hook EmployeeWorkRange - Data para criar:",
      JSON.stringify(workRangeData, null, 2)
    );

    try {
      const response = await fetch(`/api/employee/${employeeId}/work_range`, {
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
        title: "Horário criado!",
        description: "O horário foi criado com sucesso.",
      });

      console.log("✅ Hook EmployeeWorkRange - Criado com sucesso:", result);

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao criar horário",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("❌ Hook EmployeeWorkRange - Erro ao criar:", errorMessage);
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT - Atualizar employee work_range
  const updateEmployeeWorkRange = async (
    employeeId: string,
    workRangeId: string,
    workRangeData: Partial<EmployeeWorkRangeData>
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "🔄 Hook EmployeeWorkRange - Iniciando updateEmployeeWorkRange para employeeId:",
      employeeId,
      "workRangeId:",
      workRangeId
    );
    console.log(
      "📋 Hook EmployeeWorkRange - Data para atualizar:",
      JSON.stringify(workRangeData, null, 2)
    );

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}`,
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
        throw new Error(
          errorData.message || "Erro ao atualizar employee work_range"
        );
      }

      const result = await response.json();

      setSuccess(true);
      setData(result.data || result);

      toast({
        title: "Horário atualizado!",
        description: "O horário foi atualizado com sucesso.",
      });

      console.log(
        "✅ Hook EmployeeWorkRange - Atualizado com sucesso:",
        result
      );

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao atualizar horário",
        description: errorMessage,
        variant: "destructive",
      });

      console.error(
        "❌ Hook EmployeeWorkRange - Erro ao atualizar:",
        errorMessage
      );
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Deletar employee work_range
  const deleteEmployeeWorkRange = async (
    employeeId: string,
    workRangeId: string
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "🗑️ Hook EmployeeWorkRange - Iniciando deleteEmployeeWorkRange para employeeId:",
      employeeId,
      "workRangeId:",
      workRangeId
    );

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao deletar employee work_range"
        );
      }

      const result = await response.json();

      setSuccess(true);
      setData(null); // Limpar dados após deletar

      toast({
        title: "Horário deletado!",
        description: "O horário foi removido com sucesso.",
      });

      console.log("✅ Hook EmployeeWorkRange - Deletado com sucesso:", result);

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao deletar horário",
        description: errorMessage,
        variant: "destructive",
      });

      console.error(
        "❌ Hook EmployeeWorkRange - Erro ao deletar:",
        errorMessage
      );
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
    getEmployeeWorkRange,
    createEmployeeWorkRange,
    updateEmployeeWorkRange,
    deleteEmployeeWorkRange,
    reset,

    // Estados
    loading,
    success,
    error,
    data,
  };
};
