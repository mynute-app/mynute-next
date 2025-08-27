"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setBackgroundUrl(url);
      onFileChange(file);
    }
  };

  const handleRemoveBackground = async () => {
    // Se existe uma imagem inicial (do backend), remove do backend primeiro
    if (initialBackgroundUrl && onRemoveFromBackend) {
      await onRemoveFromBackend();
    }
    // Sempre remove localmente
    setBackgroundUrl("");
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="text-lg font-semibold">Imagem de Fundo (Login)</div>
      <p className="text-sm text-gray-500">
        Esta imagem será usada como fundo na tela de login
      </p>

      <Card className="relative overflow-hidden">
        <CardContent className="p-0">
          <div
            className="relative w-full h-52 bg-gray-100 cursor-pointer flex items-center justify-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() =>
              document.getElementById("background-upload")?.click()
            }
          >
            {backgroundUrl ? (
              <>
                <Image
                  src={backgroundUrl}
                  alt="Background image"
                  fill
                  className="object-cover"
                  onLoadingComplete={img => {
                    URL.revokeObjectURL(backgroundUrl);
                  }}
                />
                {isHovering && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <p className="text-white text-center p-4">
                      Clique para alterar a imagem de fundo
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6">
                <p>Clique para adicionar uma imagem de fundo</p>
                <p className="text-sm text-gray-500">
                  Recomendado: 1920x1080px
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div>
          <input
            type="file"
            id="background-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              document.getElementById("background-upload")?.click()
            }
          >
            Escolher imagem
          </Button>
        </div>

        {backgroundUrl && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveBackground}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
