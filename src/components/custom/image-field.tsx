import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

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
        alert("Por favor, selecione apenas arquivos de imagem.");
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
      <Label htmlFor="image-upload">{label}</Label>
      <div className="mt-2">
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className={`${imageClassName} object-cover rounded-lg border-2 border-gray-200`}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              onClick={handleRemoveImage}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </div>
        ) : (
          <div
            onClick={handleButtonClick}
            className={`${imageClassName} border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-white`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                <span className="text-sm text-gray-500">Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{placeholder}</span>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />

        {imagePreview && !isUploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 ml-4"
            onClick={handleButtonClick}
          >
            <Upload className="w-4 h-4 mr-2" />
            Alterar imagem
          </Button>
        )}
      </div>
    </div>
  );
}
