"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import BrandLogoUpload from "../brand-logo";
import BannerImageUpload from "./banner-image-upload";
import PreviewLayout from "./preview-layout";
import { BusinessSchema } from "../../../../../schema";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCompanyDesignImages } from "@/hooks/useUpdateCompanyDesignImages";
import { useCompanyWithFallback } from "@/hooks/use-company-with-fallback";

export default function YourBrand() {
  const { updateImages, loading: isUploading } = useUpdateCompanyDesignImages();
  const { toast } = useToast();

  // Use our new hook with fallbacks
  const {
    company,
    companyId,
    loading: loadingCompany,
    hasData,
  } = useCompanyWithFallback();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Log company data for debugging
  useEffect(() => {
    console.log("Company data with fallbacks:", company);
    console.log("Has company data:", hasData);
  }, [company, hasData]);

  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleUpload = async () => {
    try {
      await updateImages({
        logo: logoFile ?? undefined,
        banner: bannerFile ?? undefined,
        companyId: companyId || undefined,
      });

      toast({
        title: "✅ Imagens atualizadas com sucesso!",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao atualizar imagens",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

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
                {company.name}
                {companyId && <span className="ml-2">(ID: {companyId})</span>}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <form onSubmit={handleSubmit(handleUpload)} className="space-y-4">
          <BannerImageUpload
            initialBannerUrl={company.bannerUrl}
            onFileChange={setBannerFile}
          />

          <BrandLogoUpload
            initialLogoUrl={company.logoUrl}
            onFileChange={setLogoFile}
          />

          <Separator className="my-4" />

          {/* <BusinessInfoFields
            register={register}
            error={errors.name?.message}
            name={company.name || ""}
            taxId={company.taxId || ""}
            loading={loadingCompany}
          /> */}

          {/* <ColorSettings
            bannerColor={company.secondaryColor}
            primaryColor={company.primaryColor}
            onChange={(field, value) =>
              setPreviewConfig(prev => ({ ...prev, [field]: value }))
            }
          /> */}

          <Separator className="my-4" />
          {/* 
          <ThemeSelector
            value={company.darkMode}
            onChange={theme =>
              setPreviewConfig(prev => ({ ...prev, dark_mode: theme }))
            }
          /> */}

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
              logo: company.logoUrl,
              bannerImage: company.bannerUrl,
              bannerColor: company.secondaryColor,
              primaryColor: company.primaryColor,
              dark_mode: company.darkMode,
            }}
          />
        )}
      </div>
    </div>
  );
}
