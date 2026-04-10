import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "../../../types/company";

export function useEditService() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateService = async (serviceData: {
    id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    is_active?: boolean;
    show_image?: boolean;
  }): Promise<Service | null> => {
    setIsUpdating(true);

    try {
      const requestBody: Record<string, unknown> = {
        name: serviceData.name,
        description: serviceData.description,
        price: Number(serviceData.price) || 0,
        duration: Number(serviceData.duration) || 0,
      };
      if (serviceData.is_active !== undefined)
        requestBody.is_active = serviceData.is_active;
      if (serviceData.show_image !== undefined)
        requestBody.show_image = serviceData.show_image;

      const response = await fetch(`/api/service/${serviceData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro ao atualizar serviço",
          description: "Ocorreu um erro ao tentar atualizar os dados.",
          variant: "destructive",
        });

        return null;
      }

      toast({
        title: "Serviço atualizado!",
        description: "Os dados foram salvos com sucesso.",
      });

      return responseData;
    } catch {
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
