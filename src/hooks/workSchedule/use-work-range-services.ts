import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseWorkRangeServicesProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useWorkRangeServices = (props?: UseWorkRangeServicesProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // POST - Adicionar serviços ao work_range
  const addServicesToWorkRange = async (
    branchId: string,
    workRangeId: string,
    serviceIds: string[]
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log("📥 Hook WorkRangeServices - Adicionando serviços:", {
      branchId,
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
        "📋 Hook WorkRangeServices - Payload preparado:",
        JSON.stringify(servicesPayload, null, 2)
      );

      console.log(
        "🔍 Hook WorkRangeServices - Formato comparado com documentação:",
        {
          documentacao: [{ id: "efaaca83-442c-4156-b339-89228aeea54d" }],
          nossoPayload: servicesPayload,
          saoIguais:
            JSON.stringify([{ id: "efaaca83-442c-4156-b339-89228aeea54d" }]) ===
            JSON.stringify(servicesPayload),
        }
      );

      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(servicesPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(
        "✅ Hook WorkRangeServices - Serviços adicionados:",
        responseData
      );

      setSuccess(true);
      setError(null);

      toast({
        title: "Serviços adicionados",
        description: `${serviceIds.length} serviço(s) adicionado(s) ao horário com sucesso.`,
      });

      props?.onSuccess?.();
      return responseData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao adicionar serviços",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      console.error("❌ Hook WorkRangeServices - Erro ao adicionar:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Remover serviço específico do work_range
  const removeServiceFromWorkRange = async (
    branchId: string,
    workRangeId: string,
    serviceId: string
  ) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    console.log("🗑️ Hook WorkRangeServices - Removendo serviço:", {
      branchId,
      workRangeId,
      serviceId,
    });

    try {
      const response = await fetch(
        `/api/branch/${branchId}/work_range/${workRangeId}/service/${serviceId}`,
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
        "✅ Hook WorkRangeServices - Serviço removido:",
        responseData
      );

      setSuccess(true);
      setError(null);

      toast({
        title: "Serviço removido",
        description: "Serviço removido do horário com sucesso.",
      });

      props?.onSuccess?.();
      return responseData;
    } catch (err: any) {
      const errorMessage = err.message || "Erro interno do servidor";
      setError(errorMessage);

      toast({
        title: "Erro ao remover serviço",
        description: errorMessage,
        variant: "destructive",
      });

      props?.onError?.(errorMessage);
      console.error("❌ Hook WorkRangeServices - Erro ao remover:", err);
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
    addServicesToWorkRange,
    removeServiceFromWorkRange,
    loading,
    success,
    error,
    reset,
  };
};
