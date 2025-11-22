"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUploadEmployeeImage } from "@/hooks/use-upload-employee-image";
import { useToast } from "@/hooks/use-toast";

interface UserAvatarProps {
  name?: string;
  surname?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  editable?: boolean;
  employeeId?: number | string;
  onImageChange?: (newImageUrl: string | null) => void;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-2xl",
};

export function UserAvatar({
  name = "",
  surname = "",
  imageUrl,
  size = "lg",
  className,
  editable = false,
  employeeId,
  onImageChange,
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { uploadImage, deleteImage, loading } = useUploadEmployeeImage();
  const { toast } = useToast();

  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
    }
  }, [imageUrl]);

  // Gera as iniciais do nome
  const getInitials = () => {
    const firstInitial = name?.[0]?.toUpperCase() || "";
    const lastInitial = surname?.[0]?.toUpperCase() || "";
    return firstInitial + lastInitial || "?";
  };

  // Manipula o upload da imagem
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editable || !employeeId) {
      if (!employeeId) {
        toast({
          title: "Erro",
          description: "ID do funcionário não encontrado",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      const result = await uploadImage(employeeId, file);
      if (result && result.imageUrl) {
        setImageError(false);
        onImageChange?.(result.imageUrl);
        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso!",
        });
      } else {
        throw new Error("URL da imagem não foi retornada");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  // Manipula a remoção da imagem
  const handleDeleteImage = async () => {
    if (!employeeId) {
      toast({
        title: "Erro",
        description: "ID do funcionário não encontrado",
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
      const success = await deleteImage(employeeId);

      if (success) {
        setImageError(false);
        onImageChange?.(null);
        toast({
          title: "Sucesso",
          description: "Imagem removida com sucesso!",
        });
      } else {
        throw new Error("Falha ao deletar imagem");
      }
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

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center font-bold cursor-pointer transition-all duration-200",
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
          alt={`${name} ${surname}`}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials()}</span>
      )}

      {/* Overlay para upload quando editável */}
      {editable && (
        <>
          {(isHovered || loading) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <div className="flex gap-2 relative z-10">
                  {/* Ícone de upload */}
                  <button
                    onClick={() => {
                      const inputId = `file-input-${employeeId || "default"}`;
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
            id={`file-input-${employeeId || "default"}`}
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
