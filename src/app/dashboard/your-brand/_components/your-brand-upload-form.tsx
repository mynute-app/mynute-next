"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useUpdateCompanyDesignImages } from "@/hooks/useUpdateCompanyDesignImages";
import { useCompanyImageDelete } from "@/hooks/use-company-image-delete";
import { useToast } from "@/hooks/use-toast";
import BannerImageUpload from "./banner-image-upload";
import BrandLogoUpload from "../brand-logo";
import BackgroundImageUpload from "./background-image-upload";
import ColorSettings from "./color-settings";
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
  const [isUploading, setIsUploading] = useState(false);

  const [colorConfig, setColorConfig] = useState({
    primary: company?.design?.colors?.primary || "#000000",
    secondary: company?.design?.colors?.secondary || "#FFFFFF",
    tertiary: company?.design?.colors?.tertiary || "#CCCCCC",
    quaternary: company?.design?.colors?.quaternary || "#999999",
  });

  const { updateImages } = useUpdateCompanyDesignImages();
  const { deleteImage, isDeleting } = useCompanyImageDelete();

  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!company?.id) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await updateImages({
        logo: logoFile ?? undefined,
        banner: bannerFile ?? undefined,
        background: backgroundFile ?? undefined,
        colors: colorConfig,
      });

      toast({
        title: "Sucesso",
        description: "Marca atualizada com sucesso!",
      });

      console.log("Resposta da API recebida no componente:", response);

      onUploadSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageType: string) => {
    const success = await deleteImage(imageType);
    if (success) {
      // Atualizar o estado local após a remoção bem-sucedida
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

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <BannerImageUpload
        initialBannerUrl={company?.design?.images?.banner?.url || ""}
        onFileChange={setBannerFile}
        onRemoveFromBackend={() => handleDeleteImage("banner")}
      />

      <BrandLogoUpload
        initialLogoUrl={company?.design?.images?.logo?.url || ""}
        onFileChange={setLogoFile}
        onRemoveFromBackend={() => handleDeleteImage("logo")}
      />

      <BackgroundImageUpload
        initialBackgroundUrl={company?.design?.images?.background?.url || ""}
        onFileChange={setBackgroundFile}
        onRemoveFromBackend={() => handleDeleteImage("background")}
      />

      {/* <ColorSettings
        colors={colorConfig}
        onChange={newColors => setColorConfig(newColors)}
      /> */}

      <Separator className="my-4" />

      <div className="pt-6">
        <button
          type="submit"
          className="bg-primary text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading || isDeleting}
        >
          {isUploading
            ? "Salvando..."
            : isDeleting
            ? "Removendo..."
            : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
