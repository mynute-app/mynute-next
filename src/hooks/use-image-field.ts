import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseImageFieldOptions {
  initialImage?: string | null;
  uploadEndpoint?: string;
  deleteEndpoint?: string;
  autoUpload?: boolean;
}

export function useImageField({
  initialImage = null,
  uploadEndpoint,
  deleteEndpoint,
  autoUpload = true,
}: UseImageFieldOptions = {}) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleImageChange = async (file: File | null) => {
    if (file) {
      // Mostrar preview imediatamente
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);

      // Upload automático se configurado
      if (autoUpload && uploadEndpoint) {
        await uploadImage(file);
      }
    } else {
      setImagePreview(initialImage);
      setImageFile(null);
    }
  };

  const uploadImage = async (file: File) => {
    if (!uploadEndpoint) {
      console.warn("Upload endpoint não fornecido");
      return;
    }

    setIsUploading(true);

    try {
      toast({
        title: "Enviando imagem...",
        description: "A imagem está sendo enviada para o servidor.",
      });

      const formData = new FormData();
      formData.append("profile", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer upload da imagem");
      }

      const result = await response.json();
      console.log("✅ Imagem enviada com sucesso:", result);

      // Atualizar o preview com a nova URL da imagem se retornada
      if (result.image_url) {
        setImagePreview(result.image_url);
      }

      toast({
        title: "Imagem enviada!",
        description: "A imagem foi atualizada com sucesso.",
      });

      // Resetar o arquivo após upload bem-sucedido
      setImageFile(null);

      return result;
    } catch (error) {
      console.error("❌ Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });

      // Em caso de erro, reverter o preview
      setImagePreview(initialImage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    if (!deleteEndpoint) {
      // Se não há endpoint de delete, apenas remove localmente
      setImagePreview(null);
      setImageFile(null);
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(deleteEndpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao remover a imagem");
      }

      setImagePreview(null);
      setImageFile(null);

      toast({
        title: "Imagem removida!",
        description: "A imagem foi removida com sucesso.",
      });
    } catch (error) {
      console.error("❌ Erro ao remover imagem:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRemoving(false);
    }
  };

  // Função para upload manual (quando autoUpload está desabilitado)
  const manualUpload = async () => {
    if (!imageFile || !uploadEndpoint) {
      console.warn("Arquivo ou endpoint não disponível para upload manual");
      return;
    }

    return await uploadImage(imageFile);
  };

  return {
    imagePreview,
    imageFile,
    isUploading,
    isRemoving,
    handleImageChange,
    removeImage,
    manualUpload,
    hasChanges: !!imageFile,
  };
}
