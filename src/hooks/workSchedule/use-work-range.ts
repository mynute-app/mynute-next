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

export const useWorkRange = (props?: UseWorkRangeProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WorkRangeData | null>(null);
  const { toast } = useToast();

  // GET - Buscar work_range por ID
  const getWorkRange = async (
    branchId: string,
    workRangeId: string,
    options?: RequestOptions,
  ) => {
    const showErrorToast = options?.showErrorToast ?? true;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "Erro ao buscar work_range",
        );
        throw new Error(message);
      }

      const result = await response.json();

      // Normalizar os dados se necessário
      const workRangeData = result.data || result;

      setData(workRangeData);

      return workRangeData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      if (showErrorToast) {
        toast({
          title: "Erro ao buscar work_range",
          description: errorMessage,
          variant: "destructive",
        });
      }

      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST - Criar novo work_range
  const createWorkRange = async (
    branchId: string,
    workRangeData: Partial<WorkRangeData>,
    options?: RequestOptions,
  ) => {
    const showSuccessToast = options?.showSuccessToast ?? true;
    const showErrorToast = options?.showErrorToast ?? true;
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch(`/api/branch/${branchId}/work_range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workRangeData),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "Erro ao criar work_range",
        );
        throw new Error(message);
      }

      const result = await response.json();

      setSuccess(true);
      setData(result.data || result);

      if (showSuccessToast) {
        toast({
          title: "Horario criado!",
          description: "O horario foi criado com sucesso.",
        });
      }

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      if (showErrorToast) {
        toast({
          title: "Erro ao criar work_range",
          description: errorMessage,
          variant: "destructive",
        });
      }

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
    workRangeData: Partial<WorkRangeData>,
    options?: RequestOptions,
  ) => {
    const showSuccessToast = options?.showSuccessToast ?? true;
    const showErrorToast = options?.showErrorToast ?? true;
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workRangeData),
        },
      );

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "Erro ao atualizar work_range",
        );
        throw new Error(message);
      }

      const result = await response.json();

      setSuccess(true);
      setData(result.data || result);

      if (showSuccessToast) {
        toast({
          title: "Horario atualizado!",
          description: "O horario foi atualizado com sucesso.",
        });
      }

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      if (showErrorToast) {
        toast({
          title: "Erro ao atualizar work_range",
          description: errorMessage,
          variant: "destructive",
        });
      }

      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Deletar work_range
  const deleteWorkRange = async (
    branchId: string,
    workRangeId: string,
    options?: RequestOptions,
  ) => {
    const showSuccessToast = options?.showSuccessToast ?? true;
    const showErrorToast = options?.showErrorToast ?? true;
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "Erro ao deletar work_range",
        );
        throw new Error(message);
      }

      const result = await response.json();

      setSuccess(true);
      setData(null); // Limpar dados após deletar

      if (showSuccessToast) {
        toast({
          title: "Horario removido!",
          description: "O horario foi removido com sucesso.",
        });
      }

      props?.onSuccess?.();

      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      if (showErrorToast) {
        toast({
          title: "Erro ao deletar work_range",
          description: errorMessage,
          variant: "destructive",
        });
      }

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
