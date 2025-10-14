import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCompanyImageDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteImage = async (imageType: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/company/design/images/${imageType}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast({
          title: "Erro",
          description: `Erro ao remover a imagem ${imageType}`,
          variant: "destructive",
        });

        return false;
      }

      toast({
        title: "Sucesso",
        description: `Imagem ${imageType} removida com sucesso`,
      });

      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao remover a imagem",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteImage,
    isDeleting,
  };
}
