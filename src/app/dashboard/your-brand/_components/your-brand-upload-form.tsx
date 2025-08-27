"use client";

import { useState } from "react";
import { useCompanyImageDelete } from "@/hooks/use-company-image-delete";
import { useCompanyImageUpload } from "@/hooks/use-company-image-upload";
import BannerImageUpload from "./banner-image-upload";
import BrandLogoUpload from "../brand-logo";
import BackgroundImageUpload from "./background-image-upload";
import { Company } from "../../../../../types/company";

interface YourBrandUploadFormProps {
  company: Company;
  onUploadSuccess?: () => void;
}

export default function YourBrandUploadForm({
  company,
  onUploadSuccess,
}: YourBrandUploadFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  const { deleteImage, isDeleting } = useCompanyImageDelete();
  const { uploadImage, isUploading: isUploadingImage } =
    useCompanyImageUpload();

  const handleDeleteImage = async (imageType: string) => {
    const success = await deleteImage(imageType);
    if (success) {
      switch (imageType) {
        case "logo":
          setLogoFile(null);
          break;
        case "banner":
          setBannerFile(null);
          break;
        case "background":
          setBackgroundFile(null);
          break;
      }
      onUploadSuccess?.();
    }
  };

  const handleUploadImage = async (imageType: string, file: File) => {
    const success = await uploadImage(imageType, file);
    if (success) {
      switch (imageType) {
        case "logo":
          setLogoFile(file);
          break;
        case "banner":
          setBannerFile(file);
          break;
        case "background":
          setBackgroundFile(file);
          break;
      }
      onUploadSuccess?.();
    }
  };

  return (
    <div className="space-y-4">
      {(isUploadingImage || isDeleting) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
          {isUploadingImage && "📤 Fazendo upload da imagem..."}
          {isDeleting && "🗑️ Removendo imagem..."}
        </div>
      )}

      <BannerImageUpload
        initialBannerUrl={company?.design?.images?.banner?.url || ""}
        onFileChange={file =>
          file ? handleUploadImage("banner", file) : setBannerFile(null)
        }
        onRemoveFromBackend={() => handleDeleteImage("banner")}
      />

      <BrandLogoUpload
        initialLogoUrl={company?.design?.images?.logo?.url || ""}
        onFileChange={file =>
          file ? handleUploadImage("logo", file) : setLogoFile(null)
        }
        onRemoveFromBackend={() => handleDeleteImage("logo")}
      />

      <BackgroundImageUpload
        initialBackgroundUrl={company?.design?.images?.background?.url || ""}
        onFileChange={file =>
          file ? handleUploadImage("background", file) : setBackgroundFile(null)
        }
        onRemoveFromBackend={() => handleDeleteImage("background")}
      />

      {/* ColorSettings pode ser mantido se for necessário salvar separadamente */}
      {/* <ColorSettings
        colors={colorConfig}
        onChange={newColors => setColorConfig(newColors)}
      /> */}
    </div>
  );
}
