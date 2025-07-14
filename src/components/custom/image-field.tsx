import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  label?: string;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage?: () => void;
  isUploading?: boolean;
  isRemoving?: boolean;
  className?: string;
  imageClassName?: string;
  placeholder?: string;
}

export function ImageField({
  label = "Imagem",
  imagePreview,
  onImageChange,
  onRemoveImage,
  isUploading = false,
  isRemoving = false,
  className = "col-span-12",
  imageClassName = "w-32 h-32",
  placeholder = "Adicionar imagem",
}: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        onImageChange(file);
      } else {
        // Usar toast em vez de alert
        console.error("Tipo de arquivo inválido:", file.type);
      }
    }
  };

  const handleRemoveImage = () => {
    if (onRemoveImage) {
      onRemoveImage(); // Usa a função específica do hook se fornecida
    } else {
      onImageChange(null); // Fallback para remoção local
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </Label>

      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative group">
            {/* Container da imagem com overlay durante upload */}
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={imagePreview}
                alt="Preview"
                className={cn(
                  imageClassName,
                  "object-cover border-2 border-gray-200 shadow-md transition-all duration-300",
                  isUploading && "blur-sm"
                )}
              />

              {/* Overlay durante upload */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">Enviando...</p>
                    <div className="w-32 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de remover - só aparece quando não está fazendo upload */}
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-3 -right-3 rounded-full w-8 h-8 p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={handleRemoveImage}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        ) : (
          <div
            onClick={!isUploading ? handleButtonClick : undefined}
            className={cn(
              imageClassName,
              "border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100",
              isUploading
                ? "border-blue-300 bg-blue-50 cursor-not-allowed"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-100 hover:shadow-md"
            )}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="relative mb-3">
                  <Camera className="w-8 h-8 text-blue-400 mx-auto" />
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute -top-1 -right-1" />
                </div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Enviando imagem...
                </p>
                <div className="w-24 h-1 bg-blue-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-3 p-3 bg-white rounded-full shadow-sm">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP até 5MB</p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />

        {/* Botões de ação */}
        {imagePreview && !isUploading && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-colors"
              onClick={handleButtonClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Alterar imagem
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="px-4"
              onClick={handleRemoveImage}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
