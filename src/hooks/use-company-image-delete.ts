import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCompanyImageDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteImage = async (imageType: string): Promise<boolean> => {
    setIsDeleting(true);

    try {
      console.log(`🗑️ Removendo imagem ${imageType} da empresa...`);

      const response = await fetch(`/api/company/design/images/${imageType}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erro ao remover imagem:", errorData);

        toast({
          title: "Erro",
          description: `Erro ao remover a imagem ${imageType}`,
          variant: "destructive",
        });

        return false;
      }

      console.log(`✅ Imagem ${imageType} removida com sucesso`);

      toast({
        title: "Sucesso",
        description: `Imagem ${imageType} removida com sucesso`,
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao processar remoção:", error);

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
