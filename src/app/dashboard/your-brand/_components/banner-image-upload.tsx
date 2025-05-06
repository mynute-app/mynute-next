"use client";

import { Upload } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { GiBurningTree } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  banner: string | null;
  onUploadBanner: (dataUrl: string) => void;
  onRemoveBanner: () => void;
};

export default function BannerImageUpload({
  banner,
  onUploadBanner,
  onRemoveBanner,
}: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) onUploadBanner(reader.result.toString());
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardContent className="p-0 relative">
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md overflow-hidden relative">
          {/* Preview do banner */}
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

          {/* Botões sobrepostos */}
          <div className="absolute bottom-2 right-2 flex gap-2 z-20">
            {/* Upload Button (igual ao logo) */}
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
                onClick={onRemoveBanner}
              >
                <RiDeleteBin6Line className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>

          {/* input fora do label (igual ao logo) */}
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
