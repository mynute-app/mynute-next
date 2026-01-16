"use client";

import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  initialBannerUrl?: string | null;
  onFileChange?: (file: File | null) => void;
  onRemoveFromBackend?: () => Promise<void>;
};

export default function BannerImageUpload({
  initialBannerUrl,
  onFileChange,
  onRemoveFromBackend,
}: Props) {
  const [banner, setBanner] = useState<string | null>(initialBannerUrl ?? null);

  useEffect(() => {
    setBanner(initialBannerUrl ?? null);
  }, [initialBannerUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setBanner(reader.result.toString());
          onFileChange?.(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = async () => {
    if (initialBannerUrl && onRemoveFromBackend) {
      await onRemoveFromBackend();
    }
    setBanner(null);
    onFileChange?.(null);
  };

  return (
    <div className="relative">
      <label
        htmlFor="upload-banner"
        className="block border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        {banner ? (
          <img
            src={banner}
            alt="Banner"
            className="mx-auto max-h-56 w-full object-cover rounded-lg"
          />
        ) : (
          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        )}
        <p className="text-muted-foreground">
          Arraste uma imagem ou clique para fazer upload
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Recomendado: 1920x600px, JPG ou PNG ate 5MB
        </p>
      </label>

      <input
        id="upload-banner"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {banner && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-3 right-3"
          onClick={handleRemoveBanner}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover
        </Button>
      )}
    </div>
  );
}
