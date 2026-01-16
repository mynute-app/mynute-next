"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";

type Props = {
  initialLogoUrl?: string | null;
  onFileChange?: (file: File | null) => void;
  onRemoveFromBackend?: () => Promise<void>;
};

const BrandLogoUpload: React.FC<Props> = ({
  initialLogoUrl,
  onFileChange,
  onRemoveFromBackend,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialLogoUrl ?? null
  );

  useEffect(() => {
    setLogoPreview(initialLogoUrl ?? null);
  }, [initialLogoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setLogoPreview(reader.result.toString());
          onFileChange?.(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    if (initialLogoUrl && onRemoveFromBackend) {
      await onRemoveFromBackend();
    }
    setLogoPreview(null);
    onFileChange?.(null);
  };

  return (
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
      <label htmlFor="upload-logo" className="block cursor-pointer">
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Logo"
            className="mx-auto max-h-24 object-contain mb-2"
          />
        ) : (
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        )}
        <p className="text-sm text-muted-foreground">
          Arraste uma imagem ou clique para fazer upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, SVG ate 2MB
        </p>
      </label>

      <input
        id="upload-logo"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {logoPreview && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveLogo}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover logo
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrandLogoUpload;
