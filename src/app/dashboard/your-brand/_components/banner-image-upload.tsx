"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { GiBurningTree } from "react-icons/gi";
import { RiDeleteBin6Line } from "react-icons/ri";

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
    // Se existe uma imagem inicial (do backend), remove do backend primeiro
    if (initialBannerUrl && onRemoveFromBackend) {
      await onRemoveFromBackend();
    }
    // Sempre remove localmente
    setBanner(null);
    onFileChange?.(null);
  };

  return (
    <Card>
      <CardContent className="p-0 relative">
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md overflow-hidden relative">
          {banner ? (
            <img
              src={banner}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="border-2 rounded-full border-gray-300 p-2 shadow-md z-10 bg-white">
              <GiBurningTree className="size-6 text-gray-700" />
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex gap-2 z-20">
            <label
              htmlFor="upload-banner"
              className="cursor-pointer text-gray-700 border border-gray-300 rounded-full px-4 py-1 text-sm hover:bg-gray-100 transition items-center gap-2 inline-flex"
            >
              <Upload className="h-4 w-4" />
              Banner
            </label>

            {banner && (
              <Button
                type="button"
                variant="destructive"
                className="rounded-full px-4 py-1 text-sm"
                onClick={handleRemoveBanner}
              >
                <RiDeleteBin6Line className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>

          <input
            id="upload-banner"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
