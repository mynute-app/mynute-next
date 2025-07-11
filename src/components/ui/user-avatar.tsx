"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  surname?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onImageUpload?: (file: File) => void;
  editable?: boolean;
  loading?: boolean;
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
  onImageUpload,
  editable = false,
  loading = false,
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Gera as iniciais do nome
  const getInitials = () => {
    const firstInitial = name?.[0]?.toUpperCase() || "";
    const lastInitial = surname?.[0]?.toUpperCase() || "";
    return firstInitial + lastInitial || "?";
  };

  // Manipula o upload da imagem
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
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
                <svg
                  className="w-6 h-6 text-white"
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
              )}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            title="Clique para alterar a foto"
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}
