"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseDeleteCompanyClientProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useDeleteCompanyClient(props?: UseDeleteCompanyClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteCompanyClient = async (
    clientId: string
  ): Promise<boolean> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/company-client/${clientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.message || "Erro ao deletar cliente";

        if (props?.onError) {
          props.onError(errorMessage);
        }

        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });

        return false;
      }

      if (props?.onSuccess) {
        props.onSuccess();
      }

      toast({
        title: "Sucesso",
        description: "Cliente deletado com sucesso",
      });

      return true;
    } catch (error) {
      const errorMessage = "Erro interno ao deletar cliente";

      if (props?.onError) {
        props.onError(errorMessage);
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteCompanyClient,
    isDeleting,
  };
}
