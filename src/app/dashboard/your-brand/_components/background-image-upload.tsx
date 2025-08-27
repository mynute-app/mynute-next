"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { MdOutlineImage } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

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
      <div>
        <div className="text-lg font-semibold">Imagem de Fundo (Login)</div>
        <p className="text-sm text-gray-500">
          Esta imagem será usada como fundo na tela de login
        </p>
      </div>

      <Card>
        <CardContent className="p-0 relative">
          <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md overflow-hidden relative">
            {backgroundUrl ? (
              <img
                src={backgroundUrl}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="border-2 rounded-full border-gray-300 p-2 shadow-md z-10 bg-white">
                <MdOutlineImage className="size-6 text-gray-700" />
              </div>
            )}

            <div className="absolute bottom-2 right-2 flex gap-2 z-20">
              <label
                htmlFor="upload-background"
                className="cursor-pointer text-gray-700 border border-gray-300 rounded-full px-4 py-1 text-sm hover:bg-gray-100 transition items-center gap-2 inline-flex"
              >
                <Upload className="h-4 w-4" />
                Background
              </label>

              {backgroundUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-full px-4 py-1 text-sm"
                  onClick={handleRemoveBackground}
                >
                  <RiDeleteBin6Line className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              )}
            </div>

            <input
              id="upload-background"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
