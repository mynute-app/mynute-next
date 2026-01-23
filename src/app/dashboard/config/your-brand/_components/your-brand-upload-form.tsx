"use client";
import { useCompanyImageDelete } from "@/hooks/use-company-image-delete";
import { useCompanyImageUpload } from "@/hooks/use-company-image-upload";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload } from "lucide-react";
import BannerImageUpload from "./banner-image-upload";
import BrandLogoUpload from "../brand-logo";
import BackgroundImageUpload from "./background-image-upload";
import { Company } from "../../../../../../types/company";


interface YourBrandUploadFormProps {
  company: Company;
}

export default function YourBrandUploadForm({
  company,
}: YourBrandUploadFormProps) {
  const { deleteImage, isDeleting } = useCompanyImageDelete();
  const { uploadImage, isUploading: isUploadingImage } =
    useCompanyImageUpload();

  const handleDeleteImage = async (imageType: string) => {
    await deleteImage(imageType);
  };

  const handleUploadImage = async (imageType: string, file: File) => {
    await uploadImage(imageType, file);
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
              onFileChange={file => {
                if (file) {
                  handleUploadImage("logo", file);
                }
              }}
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

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Banner Principal (Hero)
        </h2>
        <BannerImageUpload
          initialBannerUrl={company?.design?.images?.banner?.url || ""}
          onFileChange={file => {
            if (file) {
              handleUploadImage("banner", file);
            }
          }}
          onRemoveFromBackend={() => handleDeleteImage("banner")}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Imagem de Fundo (Login)
        </h2>
        <BackgroundImageUpload
          initialBackgroundUrl={company?.design?.images?.background?.url || ""}
          onFileChange={file => {
            if (file) {
              handleUploadImage("background", file);
            }
          }}
          onRemoveFromBackend={() => handleDeleteImage("background")}
        />
      </div>
    </div>
  );
}
