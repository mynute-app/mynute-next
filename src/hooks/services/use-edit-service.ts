import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string;
}

export function useEditService() {
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateService = async (serviceData: {
    id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
  }): Promise<Service | null> => {
    setIsUpdating(true);

    try {
      // Preparar os dados para envio (converter strings para números)
      const requestBody = {
        name: serviceData.name,
        description: serviceData.description,
        price: Number(serviceData.price) || 0,
        duration: Number(serviceData.duration) || 0,
      };

      const response = await fetch(`/api/service/${serviceData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error(
          "❌ Erro ao atualizar serviço:",
          response.status,
          responseData
        );

        toast({
          title: "Erro ao atualizar serviço",
          description: "Ocorreu um erro ao tentar atualizar os dados.",
          variant: "destructive",
        });

        return null;
      }

      console.log("✅ Serviço atualizado com sucesso:", responseData);

      toast({
        title: "Serviço atualizado!",
        description: "Os dados foram salvos com sucesso.",
      });

      return responseData;
    } catch (error) {
      console.error("❌ Erro ao atualizar serviço:", error);

      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateService,
  };
}
