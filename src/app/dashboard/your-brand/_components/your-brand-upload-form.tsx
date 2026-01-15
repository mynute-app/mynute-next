"use client";

import { useState } from "react";
import { useCompanyImageDelete } from "@/hooks/use-company-image-delete";
import { useCompanyImageUpload } from "@/hooks/use-company-image-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload } from "lucide-react";
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
    <div className="space-y-8">
      {(isUploadingImage || isDeleting) && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-blue-700">
            {isUploadingImage && "Fazendo upload da imagem..."}
            {isDeleting && "Removendo imagem..."}
          </span>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Logo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Logo Principal (claro)</Label>
            <BrandLogoUpload
              initialLogoUrl={company?.design?.images?.logo?.url || ""}
              onFileChange={file =>
                file ? handleUploadImage("logo", file) : setLogoFile(null)
              }
              onRemoveFromBackend={() => handleDeleteImage("logo")}
            />
          </div>
          <div className="space-y-3">
            <Label>Logo Alternativa (escuro)</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-sidebar">
              <Upload className="w-8 h-8 mx-auto text-sidebar-foreground/50 mb-2" />
              <p className="text-sm text-sidebar-foreground/70">
                Arraste uma imagem ou clique para fazer upload
              </p>
              <p className="text-xs text-sidebar-foreground/50 mt-1">
                PNG, SVG ate 2MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Favicon</h2>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" type="button">
              <Upload className="w-4 h-4 mr-2" />
              Fazer upload
            </Button>
            <p className="text-xs text-muted-foreground">
              Recomendado: 32x32px ou 64x64px, formato ICO ou PNG
            </p>
          </div>
        </div>
      </div> */}

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Banner Principal (Hero)
        </h2>
        <BannerImageUpload
          initialBannerUrl={company?.design?.images?.banner?.url || ""}
          onFileChange={file =>
            file ? handleUploadImage("banner", file) : setBannerFile(null)
          }
          onRemoveFromBackend={() => handleDeleteImage("banner")}
        />
      </div>

      {/* <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Galeria do Negocio
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Imagens do espaco, equipamentos, antes/depois de servicos
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4" type="button">
          <Upload className="w-4 h-4 mr-2" />
          Adicionar mais imagens
        </Button>
      </div> */}

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Imagem de Fundo (Login)
        </h2>
        <BackgroundImageUpload
          initialBackgroundUrl={company?.design?.images?.background?.url || ""}
          onFileChange={file =>
            file
              ? handleUploadImage("background", file)
              : setBackgroundFile(null)
          }
          onRemoveFromBackend={() => handleDeleteImage("background")}
        />
      </div>
    </div>
  );
}
