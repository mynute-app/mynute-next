import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

interface UseBranchImageProps {
  branchId: number | string;
  currentImage?: string;
  imageType?: string; // Novo parâmetro para especificar o tipo da imagem
  onSuccess?: () => void; // Callback para executar após sucesso
}

export function useBranchImage({
  branchId,
  currentImage,
  imageType = "profile", // Default para "profile"
  onSuccess, // Novo callback
}: UseBranchImageProps) {
  const { data: session } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImage || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  /**
   * Faz upload da imagem da filial
   */
  const uploadImage = async (file: File): Promise<boolean> => {
    // Validação de segurança - aceita number > 0 ou string não vazia
    if (
      !branchId ||
      (typeof branchId === "number" && branchId <= 0) ||
      (typeof branchId === "string" && branchId.trim().length === 0)
    ) {
      console.error("❌ Erro: branchId inválido:", branchId);
      toast({
        title: "Erro",
        description: "ID da filial não encontrado.",
        variant: "destructive",
      });
      return false;
    }

    if (!session?.accessToken) {
      toast({
        title: "Erro",
        description: "Token de autenticação não encontrado",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUploading(true);

      // Preparar FormData
      const formData = new FormData();
      formData.append(imageType, file); // Usa o imageType como nome do campo

      // Fazer requisição para nossa rota PATCH padronizada
      const response = await fetch(`/api/branch/${branchId}/design/images`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro na resposta:", errorData);

        toast({
          title: "Erro ao fazer upload",
          description: errorData.message || "Erro interno do servidor",
          variant: "destructive",
        });
        return false;
      }

      const data = await response.json();

      // Atualizar preview da imagem
      if (data.image_url) {
        setImagePreview(data.image_url);
      }

      toast({
        title: "Sucesso!",
        description: `Imagem ${imageType} da filial atualizada com sucesso`,
      });

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error("❌ Erro no upload:", error);
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

  /**
   * Remove a imagem da filial
   */
  const removeImage = async (): Promise<boolean> => {
    // Validação de segurança - aceita number > 0 ou string não vazia
    if (
      !branchId ||
      (typeof branchId === "number" && branchId <= 0) ||
      (typeof branchId === "string" && branchId.trim().length === 0)
    ) {
      console.error("❌ Erro: branchId inválido:", branchId);
      toast({
        title: "Erro",
        description: "ID da filial não encontrado.",
        variant: "destructive",
      });
      return false;
    }

    if (!session?.accessToken) {
      toast({
        title: "Erro",
        description: "Token de autenticação não encontrado",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsRemoving(true);

      // Fazer requisição DELETE para a nova rota com image_type
      const response = await fetch(
        `/api/branch/${branchId}/design/images/${imageType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro na resposta:", errorData);

        toast({
          title: "Erro ao remover imagem",
          description: errorData.message || "Erro interno do servidor",
          variant: "destructive",
        });
        return false;
      }

      // Limpar preview da imagem
      setImagePreview(null);

      toast({
        title: "Sucesso!",
        description: `Imagem ${imageType} da filial removida com sucesso`,
      });

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error("❌ Erro na remoção:", error);
      toast({
        title: "Erro",
        description: "Erro interno ao remover a imagem",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  /**
   * Handler para mudança de imagem (upload)
   */
  const handleImageChange = async (file: File | null) => {
    // Se file for null, não faz nada (remoção é tratada por handleRemoveImage)
    if (!file) return;

    // Validações básicas no frontend
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Use apenas JPEG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 5MB permitido",
        variant: "destructive",
      });
      return;
    }

    // Preview temporário enquanto faz upload
    const reader = new FileReader();
    reader.onload = e => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    const success = await uploadImage(file);

    // Se falhou, reverter o preview
    if (!success) {
      setImagePreview(currentImage || null);
    }
  };

  /**
   * Handler para remoção de imagem
   */
  const handleRemoveImage = async () => {
    await removeImage();
  };

  return {
    imagePreview,
    isUploading,
    isRemoving,
    handleImageChange,
    handleRemoveImage,
    uploadImage,
    removeImage,
  };
}
