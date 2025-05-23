"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import BrandLogoUpload from "../brand-logo";
import BannerImageUpload from "./banner-image-upload";
import PreviewLayout from "./preview-layout";
import { BusinessSchema } from "../../../../../schema";
import { useGetUser } from "@/hooks/get-useUser";
import ColorSettings from "./color-settings";
import { BusinessInfoFields } from "./business-Info-fields";
import ThemeSelector from "./ThemeSelector";
import { useCompany } from "@/hooks/get-company";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCompanyDesignImages } from "@/hooks/useUpdateCompanyDesignImages";

export default function YourBrand() {
  const { user, loading } = useGetUser();
  const { updateImages, loading: isUploading } = useUpdateCompanyDesignImages();
  const { toast } = useToast();
  const { company, loading: loadingCompany } = useCompany();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  console.log(company);

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

  // const renderCount = useRef(0);
  // renderCount.current += 1;
  // console.log("esse componente re-renderizou", renderCount.current, "vezes");

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
                {company.legal_name}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <form onSubmit={handleSubmit(handleUpload)} className="space-y-4">
          {loadingCompany || loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                readOnly
                className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 border-none focus:ring-0"
              />
            </>
          )}

          <BannerImageUpload
            initialBannerUrl={company?.design?.images?.banner_url}
            onFileChange={setBannerFile}
          />

          <BrandLogoUpload
            initialLogoUrl={company?.design?.images?.logo_url}
            onFileChange={setLogoFile}
          />

          <Separator className="my-4" />

          {/* <BusinessInfoFields
            register={register}
            error={errors.name?.message}
            name={company?.name || ""}
            taxId={company?.tax_id || ""}
            loading={loading}
          /> */}

          {/* <ColorSettings
            bannerColor={previewConfig.bannerColor}
            primaryColor={previewConfig.primaryColor}
            onChange={(field, value) =>
              setPreviewConfig(prev => ({ ...prev, [field]: value }))
            }
          /> */}

          <Separator className="my-4" />
          {/* 
          <ThemeSelector
            value={previewConfig.dark_mode}
            onChange={theme =>
              setPreviewConfig(prev => ({ ...prev, dark_mode: theme }))
            }
          /> */}

          <Separator className="my-4" />

          <div className="pt-6">
            <button
              type="submit"
              className="bg-primary text-white rounded-md px-4 py-2"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </div>

      <div className="w-full md:w-1/2 rounded-md shadow-sm">
        <PreviewLayout
          config={{
            logo: company?.design?.images?.logo_url,
            bannerImage: company?.design?.images?.banner_url,
            bannerColor: company?.design?.colors?.secondary,
            primaryColor: company?.design?.colors?.primary,
            dark_mode: company?.design?.dark_mode,
          }}
        />
      </div>
    </div>
  );
}
