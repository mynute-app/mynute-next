import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { useGetService } from "./use-get-service";

interface UseServiceImageProps {
  serviceId: string;
  currentImage?: string;
  imageType?: string; // Tipo da imagem (main, thumbnail, etc.)
  onSuccess?: () => void; // Callback para executar após sucesso
}

export function useServiceImage({
  serviceId,
  currentImage,
  imageType = "main", // Default para "main"
  onSuccess,
}: UseServiceImageProps) {
  const { data: session } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Buscar dados atuais do serviço para pegar a imagem real
  const {
    service,
    loading: serviceLoading,
    refetch,
  } = useGetService({
    serviceId,
    enabled: !!serviceId,
  });

  // Atualizar preview quando o serviço for carregado ou currentImage mudar
  useEffect(() => {
    if (service?.imageUrl) {
      console.log("🖼️ Imagem do serviço encontrada:", service.imageUrl);
      setImagePreview(service.imageUrl);
    } else if (currentImage) {
      console.log("🖼️ Usando imagem atual:", currentImage);
      setImagePreview(currentImage);
    } else {
      setImagePreview(null);
    }
  }, [service, currentImage]);

  /**
   * Faz upload da imagem do serviço
   */
  const uploadImage = async (file: File): Promise<boolean> => {
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

      console.log(`🔄 Enviando imagem ${imageType} para serviço:`, serviceId);

      // Fazer requisição para nossa rota PATCH padronizada
      const response = await fetch(`/api/service/${serviceId}/design/images`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      console.log("📡 Status da resposta:", response.status);

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
      console.log("✅ Upload realizado com sucesso:", data);

      // Atualizar preview da imagem
      if (data.image_url) {
        setImagePreview(data.image_url);
      }

      toast({
        title: "Sucesso!",
        description: `Imagem ${imageType} do serviço atualizada com sucesso`,
      });

      // Refetch dos dados do serviço para sincronizar o estado
      if (refetch) {
        console.log("🔄 Refazendo busca dos dados do serviço");
        await refetch();
      }

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
   * Remove a imagem do serviço
   */
  const removeImage = async (): Promise<boolean> => {
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

      console.log(`🗑️ Removendo imagem ${imageType} do serviço:`, serviceId);

      // Fazer requisição DELETE para a nova rota com image_type
      const response = await fetch(
        `/api/service/${serviceId}/design/images/${imageType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      console.log("📡 Status da resposta:", response.status);

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

      console.log("✅ Imagem removida com sucesso");

      // Limpar preview da imagem
      setImagePreview(null);

      toast({
        title: "Sucesso!",
        description: `Imagem ${imageType} do serviço removida com sucesso`,
      });

      // Refetch dos dados do serviço para sincronizar o estado
      if (refetch) {
        console.log("🔄 Refazendo busca dos dados do serviço após remoção");
        await refetch();
      }

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
