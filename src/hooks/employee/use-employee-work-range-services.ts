import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseEmployeeWorkRangeServicesProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useEmployeeWorkRangeServices = (
  props?: UseEmployeeWorkRangeServicesProps
) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  // GET - Buscar services do work_range do employee
  const getEmployeeWorkRangeServices = async (
    employeeId: string,
    workRangeId: string
  ) => {
    setLoading(true);
    setError(null);
    setData(null);

    console.log("📥 Hook EmployeeWorkRangeServices - Buscando services:", {
      employeeId,
      workRangeId,
    });

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}/services`,
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
          errorData.message || "Erro ao buscar services do work_range"
        );
      }

      const result = await response.json();
      console.log(
        "✅ Hook EmployeeWorkRangeServices - Services encontrados:",
        result
      );

      setData(result.data || result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao buscar services",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("❌ Hook EmployeeWorkRangeServices - Erro ao buscar:", err);
      props?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST - Adicionar services ao work_range do employee
  const addServicesToEmployeeWorkRange = async (
    employeeId: string,
    workRangeId: string,
    serviceIds: string[]
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log("📥 Hook EmployeeWorkRangeServices - Adicionando services:", {
      employeeId,
      workRangeId,
      serviceIds,
      serviceIdsTypes: serviceIds.map(id => ({ id, type: typeof id })),
    });

    try {
      // Converter os IDs para o formato esperado pela API
      const servicesPayload = serviceIds.map(id => ({
        id: id, // Mantém como string conforme recebido
      }));

      console.log(
        "📋 Hook EmployeeWorkRangeServices - Payload preparado:",
        JSON.stringify(servicesPayload, null, 2)
      );

      // Envolver array no objeto conforme especificação do backend
      const requestBody = {
        services: servicesPayload,
      };

      console.log(
        "🔍 Hook EmployeeWorkRangeServices - Request body final:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(
        "✅ Hook EmployeeWorkRangeServices - Services adicionados:",
        responseData
      );

      setSuccess(true);
      setError(null);
      setData(responseData.data || responseData);

      toast({
        title: "Services adicionados",
        description: `${serviceIds.length} service(s) adicionado(s) ao horário do employee com sucesso.`,
      });

      props?.onSuccess?.();
      return responseData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao adicionar services",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      console.error(
        "❌ Hook EmployeeWorkRangeServices - Erro ao adicionar:",
        err
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT - Atualizar services do work_range do employee
  const updateEmployeeWorkRangeServices = async (
    employeeId: string,
    workRangeId: string,
    serviceIds: string[]
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log("🔄 Hook EmployeeWorkRangeServices - Atualizando services:", {
      employeeId,
      workRangeId,
      serviceIds,
    });

    try {
      const servicesPayload = serviceIds.map(id => ({
        id: id,
      }));

      const requestBody = {
        services: servicesPayload,
      };

      console.log(
        "🔍 Hook EmployeeWorkRangeServices - Request body para atualização:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}/services`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(
        "✅ Hook EmployeeWorkRangeServices - Services atualizados:",
        responseData
      );

      setSuccess(true);
      setError(null);
      setData(responseData.data || responseData);

      toast({
        title: "Services atualizados",
        description:
          "Services do work_range do employee atualizados com sucesso.",
      });

      props?.onSuccess?.();
      return responseData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao atualizar services",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      console.error(
        "❌ Hook EmployeeWorkRangeServices - Erro ao atualizar:",
        err
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Remover todos os services do work_range do employee
  const removeAllEmployeeWorkRangeServices = async (
    employeeId: string,
    workRangeId: string
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log(
      "🗑️ Hook EmployeeWorkRangeServices - Removendo todos os services:",
      {
        employeeId,
        workRangeId,
      }
    );

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/work_range/${workRangeId}/services`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(
        "✅ Hook EmployeeWorkRangeServices - Services removidos:",
        responseData
      );

      setSuccess(true);
      setError(null);
      setData(null); // Limpar dados após remoção

      toast({
        title: "Services removidos",
        description:
          "Todos os services foram removidos do work_range do employee.",
      });

      props?.onSuccess?.();
      return responseData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao remover services",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      console.error(
        "❌ Hook EmployeeWorkRangeServices - Erro ao remover:",
        err
      );
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
    getEmployeeWorkRangeServices,
    addServicesToEmployeeWorkRange,
    updateEmployeeWorkRangeServices,
    removeAllEmployeeWorkRangeServices,
    reset,

    // Estados
    loading,
    success,
    error,
    data,
  };
};
