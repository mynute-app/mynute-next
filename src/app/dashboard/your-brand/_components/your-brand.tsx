"use client";

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
import { useState } from "react";
import ColorSettings from "./color-settings";
import { BusinessInfoFields } from "./business-Info-fields";

export default function YourBrand() {
  const { user, loading } = useGetUser();
  const company = user?.company;
  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const [previewConfig, setPreviewConfig] = useState<{
    logo: string | null;
    bannerImage: string | null;
    bannerColor: string;
    primaryColor: string;
  }>({
    logo: null,
    bannerImage: null,
    bannerColor: "#f5f5f5",
    primaryColor: "#000000",
  });

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    console.log("dados", values);
  };

  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex gap-4 flex-col md:flex-row">
      <div className="w-full md:w-1/2 py-4 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="flex justify-between items-center">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="text-xl font-bold flex flex-col">
              Sua Marca
              <span className="text-sm font-thin text-gray-500">
                ({company?.name})
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : (
            <>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email}
                readOnly
                className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 border-none focus:ring-0"
              />
            </>
          )}

          <BannerImageUpload
            banner={previewConfig.bannerImage}
            onUploadBanner={base64 =>
              setPreviewConfig(prev => ({ ...prev, bannerImage: base64 }))
            }
            onRemoveBanner={() =>
              setPreviewConfig(prev => ({ ...prev, bannerImage: null }))
            }
          />

          <BrandLogoUpload
            logo={previewConfig.logo}
            onUploadLogo={base64 =>
              setPreviewConfig(prev => ({ ...prev, logo: base64 }))
            }
            onRemoveLogo={() =>
              setPreviewConfig(prev => ({ ...prev, logo: null }))
            }
          />
          <Separator className="my-4" />
          <BusinessInfoFields
            register={register}
            error={errors.name?.message}
            name={company?.name || ""}
            taxId={company?.tax_id || ""}
            loading={loading}
          />
          <ColorSettings
            bannerColor={previewConfig.bannerColor}
            primaryColor={previewConfig.primaryColor}
            onChange={(field, value) =>
              setPreviewConfig(prev => ({ ...prev, [field]: value }))
            }
          />
        </form>
      </div>

      <div className="w-full md:w-1/2 rounded-md shadow-sm">
        <PreviewLayout config={previewConfig} />
      </div>
    </div>
  );
}
