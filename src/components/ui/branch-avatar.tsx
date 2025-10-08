"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBranchImage } from "@/hooks/branch/use-branch-image";
import { useToast } from "@/hooks/use-toast";

interface BranchAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  editable?: boolean;
  branchId?: number | string;
  onImageChange?: (newImageUrl: string | null) => void;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-2xl",
};

export function BranchAvatar({
  name = "",
  imageUrl,
  size = "lg",
  className,
  editable = false,
  branchId,
  onImageChange,
}: BranchAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Só usar o hook se tiver branchId válido (número ou UUID string)
  const shouldUseHook =
    branchId &&
    ((typeof branchId === "number" && branchId > 0) ||
      (typeof branchId === "string" && branchId.trim().length > 0));

  // Só inicializar o hook se tiver ID válido
  const hookResult = shouldUseHook
    ? useBranchImage({
        branchId: branchId, // Passa direto, pode ser number ou string
        currentImage: imageUrl,
        imageType: "profile",
        onSuccess: () => {
          onImageChange?.(null); // Trigger para atualizar o componente pai
        },
      })
    : {
        isUploading: false,
        isRemoving: false,
        handleImageChange: async () => {},
        handleRemoveImage: async () => {},
      };

  const { isUploading, isRemoving, handleImageChange, handleRemoveImage } =
    hookResult;

  const { toast } = useToast(); // Reset image error quando imageUrl muda
  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
    }
  }, [imageUrl]);

  // Gera as iniciais do nome
  const getInitials = () => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name?.[0]?.toUpperCase() || "?";
  };

  // Manipula o upload da imagem
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editable) {
      return;
    }

    if (!shouldUseHook) {
      toast({
        title: "Erro",
        description: "ID da filial não encontrado",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 5MB permitido.",
        variant: "destructive",
      });
      return;
    }

    // Validar tipo do arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await handleImageChange(file);

      if (success) {
        setImageError(false);
        toast({
          title: "Sucesso",
          description: "Imagem da filial atualizada com sucesso!",
        });
      }
      // Se não foi sucesso, o hook já mostrou o toast de erro
    } catch (error) {
      console.error("❌ Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da imagem",
        variant: "destructive",
      });
    }
  };

  // Manipula a remoção da imagem
  const handleDeleteImage = async () => {
    if (!shouldUseHook) {
      toast({
        title: "Erro",
        description: "ID da filial não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: "Erro",
        description: "Nenhuma imagem para remover",
        variant: "destructive",
      });
      return;
    }

    try {
      await handleRemoveImage();
      setImageError(false);
      toast({
        title: "Sucesso",
        description: "Imagem da filial removida com sucesso!",
      });
    } catch (error) {
      console.error("❌ Erro ao deletar imagem:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover a imagem",
        variant: "destructive",
      });
    }
  };

  // Gera uma cor de fundo baseada no nome
  const getBackgroundColor = () => {
    if (imageUrl && !imageError) return "";

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];

    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const shouldShowImage = imageUrl && !imageError;
  const loading = isUploading || isRemoving;

  return (
    <div
      className={cn(
        " relative rounded-xl flex items-center justify-center font-bold cursor-pointer transition-all duration-200 ",
        sizeClasses[size],
        shouldShowImage ? "" : getBackgroundColor(),
        shouldShowImage ? "" : "text-white",
        editable && isHovered && "ring-2 ring-blue-500 ring-offset-2",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {shouldShowImage ? (
        <img
          src={imageUrl}
          alt={`Filial ${name}`}
          className="w-full h-full rounded-xl object-cover "
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials()}</span>
      )}

      {/* Overlay para upload quando editável */}
      {editable && (
        <>
          {(isHovered || loading) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center h-20 w-20">
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <div className="flex gap-2 relative z-10">
                  {/* Ícone de upload */}
                  <button
                    onClick={() => {
                      const inputId = `file-input-branch-${
                        branchId || "default"
                      }`;
                      const fileInput = document.querySelector(
                        `#${inputId}`
                      ) as HTMLInputElement;
                      fileInput?.click();
                    }}
                    className="hover:bg-blue-600 rounded p-1 transition-colors"
                    title="Alterar imagem"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>

                  {/* Ícone de delete se houver imagem */}
                  {shouldShowImage && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteImage();
                      }}
                      className="hover:bg-red-600 rounded p-1 transition-colors"
                      title="Remover imagem"
                      type="button"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <input
            id={`file-input-branch-${branchId || "default"}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}
