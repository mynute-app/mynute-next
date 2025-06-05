"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useCompany } from "@/hooks/get-company";
import { useUpdateCompanyDesignImages } from "@/hooks/useUpdateCompanyDesignImages";
import { useToast } from "@/hooks/use-toast";
import BannerImageUpload from "./banner-image-upload";
import BrandLogoUpload from "../brand-logo";
import BackgroundImageUpload from "./background-image-upload";
import PreviewLayout from "./preview-layout";
import ColorSettings from "./color-settings"; // certifique-se que esse nome está correto

export default function YourBrand() {
  const { company, loading: loadingCompany } = useCompany();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [colorConfig, setColorConfig] = useState({
    primary: "#000000",
    secondary: "#FFFFFF",
    tertiary: "#CCCCCC",
    quaternary: "#999999",
  });

  const { updateImages } = useUpdateCompanyDesignImages();
  const { toast } = useToast();

  useEffect(() => {
    if (company?.design?.colors) {
      setColorConfig({
        primary: company.design.colors.primary || "#000000",
        secondary: company.design.colors.secondary || "#FFFFFF",
        tertiary: company.design.colors.tertiary || "#CCCCCC",
        quaternary: company.design.colors.quaternary || "#999999",
      });
    }
  }, [company]);

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
        companyId: company.id,
        colors: colorConfig,
      });

      toast({
        title: "Sucesso",
        description: "Marca atualizada com sucesso!",
      });

      console.log("Resposta da API:", response);
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

  const companyId = company?.id;

  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex gap-4 flex-col md:flex-row">
      <div className="w-full md:w-1/2 py-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
        <div className="flex justify-between items-center">
          {loadingCompany ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="text-xl font-bold flex flex-col">
              Sua Marca
              <span className="text-sm font-thin text-gray-500">
                {company?.legal_name}
                {companyId && <span className="ml-2">(ID: {companyId})</span>}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <form onSubmit={handleUpload} className="space-y-4">
          <BannerImageUpload
            initialBannerUrl={company?.design?.images?.banner?.url || ""}
            onFileChange={setBannerFile}
          />

          <BrandLogoUpload
            initialLogoUrl={company?.design?.images?.logo?.url || ""}
            onFileChange={setLogoFile}
          />

          <BackgroundImageUpload
            initialBackgroundUrl={
              company?.design?.images?.background?.url || ""
            }
            onFileChange={setBackgroundFile}
          />

          <ColorSettings
            colors={colorConfig}
            onChange={newColors => setColorConfig(newColors)}
          />

          <Separator className="my-4" />

          <div className="pt-6">
            <button
              type="submit"
              className="bg-primary text-white rounded-md px-4 py-2"
              disabled={isUploading}
            >
              {isUploading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full md:w-1/2 rounded-md shadow-sm">
        {loadingCompany ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-full h-[600px] rounded-md" />
          </div>
        ) : (
          <PreviewLayout
            config={{
              logo: company?.design?.images?.logo?.url || "",
              bannerImage: company?.design?.images?.banner?.url || "",
              bannerColor: colorConfig.secondary,
              primaryColor: colorConfig.primary,
              dark_mode: false,
            }}
          />
        )}
      </div>
    </div>
  );
}
