import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ImageFieldProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage?: () => void;
}

export function ImageField({
  imagePreview,
  onImageChange,
  onRemoveImage,
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
    <div className="col-span-12">
      <Label htmlFor="branch-image">Imagem da Filial</Label>
      <div className="mt-2">
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview da filial"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={handleButtonClick}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-white"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Adicionar imagem</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="branch-image"
        />

        {imagePreview && (
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
