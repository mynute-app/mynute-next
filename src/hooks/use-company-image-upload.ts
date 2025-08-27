import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCompanyImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (
    imageType: string,
    file: File
  ): Promise<boolean> => {
    setIsUploading(true);

    try {
      console.log(`📤 Fazendo upload da imagem ${imageType}...`);

      const formData = new FormData();
      formData.append(imageType, file);

      const response = await fetch("/api/company/design/images", {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erro no upload:", errorData);

        toast({
          title: "Erro",
          description: `Erro ao fazer upload da imagem ${imageType}`,
          variant: "destructive",
        });

        return false;
      }

      console.log(`✅ Upload da imagem ${imageType} realizado com sucesso`);

      toast({
        title: "Sucesso",
        description: `Imagem ${imageType} atualizada com sucesso`,
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao processar upload:", error);

      toast({
        title: "Erro",
        description: "Erro interno ao fazer upload da imagem",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
}
