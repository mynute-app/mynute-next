import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

interface UseBranchImageProps {
  branchId: number | string;
  currentImage?: string;
  imageType?: string;
  onSuccess?: () => void;
}

type RequestOptions = {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
};

const isValidBranchId = (value: number | string) => {
  if (!value) return false;
  if (typeof value === "number") return value > 0;
  return value.trim().length > 0;
};

const readErrorMessage = async (response: Response, fallback: string) => {
  try {
    const errorData = await response.json();
    if (
      typeof errorData?.message === "string" &&
      errorData.message.length > 0
    ) {
      return errorData.message;
    }
  } catch {
    // Ignore JSON parsing error and fallback to text/fallback.
  }

  try {
    const text = await response.text();
    if (text.length > 0) return text;
  } catch {
    // Ignore text parsing error and keep fallback.
  }

  return fallback;
};

export function useBranchImage({
  branchId,
  currentImage,
  imageType = "profile",
  onSuccess,
}: UseBranchImageProps) {
  const { data: session } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentImage || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const uploadImage = async (
    file: File,
    options?: RequestOptions,
  ): Promise<boolean> => {
    const showSuccessToast = options?.showSuccessToast ?? true;
    const showErrorToast = options?.showErrorToast ?? true;

    if (!isValidBranchId(branchId)) {
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: "ID da filial não encontrado.",
          variant: "destructive",
        });
      }
      return false;
    }

    if (!session?.accessToken) {
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: "Token de autenticação não encontrado.",
          variant: "destructive",
        });
      }
      return false;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append(imageType, file);

      const response = await fetch(`/api/branch/${branchId}/design/images`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Erro interno do servidor",
        );
        if (showErrorToast) {
          toast({
            title: "Erro ao fazer upload",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return false;
      }

      const data = await response.json();

      const uploadedUrl =
        data?.[imageType]?.url ||
        data?.image_url ||
        data?.data?.[imageType]?.url;

      if (typeof uploadedUrl === "string" && uploadedUrl.length > 0) {
        setImagePreview(uploadedUrl);
      }

      if (showSuccessToast) {
        toast({
          title: "Sucesso",
          description: "Imagem da filial atualizada com sucesso.",
        });
      }

      onSuccess?.();

      return true;
    } catch {
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: "Erro interno ao fazer upload da imagem.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (options?: RequestOptions): Promise<boolean> => {
    const showSuccessToast = options?.showSuccessToast ?? true;
    const showErrorToast = options?.showErrorToast ?? true;

    if (!isValidBranchId(branchId)) {
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: "ID da filial não encontrado.",
          variant: "destructive",
        });
      }
      return false;
    }

    if (!session?.accessToken) {
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: "Token de autenticação não encontrado.",
          variant: "destructive",
        });
      }
      return false;
    }

    try {
      setIsRemoving(true);

      const response = await fetch(
        `/api/branch/${branchId}/design/images/${imageType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Erro interno do servidor",
        );
        if (showErrorToast) {
          toast({
            title: "Erro ao remover imagem",
            description: errorMessage,
            variant: "destructive",
          });
        }
        return false;
      }

      setImagePreview(null);

      if (showSuccessToast) {
        toast({
          title: "Sucesso",
          description: "Imagem da filial removida com sucesso.",
        });
      }

      onSuccess?.();

      return true;
    } catch {
      if (showErrorToast) {
        toast({
          title: "Erro",
          description: "Erro interno ao remover a imagem.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  const handleImageChange = async (
    file: File | null,
    options?: RequestOptions,
  ): Promise<boolean> => {
    if (!file) return false;

    const showErrorToast = options?.showErrorToast ?? true;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      if (showErrorToast) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Use apenas JPEG, PNG ou WebP.",
          variant: "destructive",
        });
      }
      return false;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      if (showErrorToast) {
        toast({
          title: "Arquivo muito grande",
          description: "Máximo de 5MB permitido.",
          variant: "destructive",
        });
      }
      return false;
    }

    const reader = new FileReader();
    reader.onload = e => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    const success = await uploadImage(file, options);

    if (!success) {
      setImagePreview(currentImage || null);
    }

    return success;
  };

  const handleRemoveImage = async (options?: RequestOptions) => {
    await removeImage(options);
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
