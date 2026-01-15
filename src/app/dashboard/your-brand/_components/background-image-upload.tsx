"use client";

import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BackgroundImageUploadProps {
  initialBackgroundUrl: string;
  onFileChange: (file: File | null) => void;
  onRemoveFromBackend?: () => Promise<void>;
}

export default function BackgroundImageUpload({
  initialBackgroundUrl,
  onFileChange,
  onRemoveFromBackend,
}: BackgroundImageUploadProps) {
  const [backgroundUrl, setBackgroundUrl] =
    useState<string>(initialBackgroundUrl);

  useEffect(() => {
    setBackgroundUrl(initialBackgroundUrl || "");
  }, [initialBackgroundUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setBackgroundUrl(reader.result.toString());
          onFileChange(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (initialBackgroundUrl && onRemoveFromBackend) {
      await onRemoveFromBackend();
    }
    setBackgroundUrl("");
    onFileChange(null);
  };

  return (
    <div className="relative">
      <label
        htmlFor="upload-background"
        className="block border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        {backgroundUrl ? (
          <img
            src={backgroundUrl}
            alt="Background"
            className="mx-auto max-h-80 w-full object-cover rounded-lg"
          />
        ) : (
          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        )}
        <p className="text-muted-foreground">
          Arraste uma imagem ou clique para fazer upload
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Recomendado: 1920x1080px, JPG ou PNG ate 5MB
        </p>
      </label>

      <input
        id="upload-background"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {backgroundUrl && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-3 right-3"
          onClick={handleRemoveBackground}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover
        </Button>
      )}
    </div>
  );
}
