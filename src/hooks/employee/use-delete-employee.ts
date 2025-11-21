import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseDeleteEmployeeProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useDeleteEmployee(props?: UseDeleteEmployeeProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteEmployee = async (
    employeeId: number | string
  ): Promise<boolean> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/employee/${employeeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Erro ao deletar funcionário";

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
        description: "Funcionário deletado com sucesso",
      });

      return true;
    } catch (error) {
      const errorMessage = "Erro interno ao deletar funcionário";

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
    deleteEmployee,
    isDeleting,
  };
}
