"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GiBurningTree } from "react-icons/gi";
import * as zod from "zod";
import { Separator } from "@/components/ui/separator";
import BrandLogoUpload from "../brand-logo";
import { BusinessInfoFields } from "./business-Info-fields";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessSchema } from "../../../../../schema";
import { useGetUser } from "@/hooks/get-useUser";
import PreviewLayout from "./preview-layout";
import { useState } from "react";

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

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    console.log("dados", values);
  };

  const [previewConfig, setPreviewConfig] = useState<{
    logo: string | null;
    bannerColor: string;
    primaryColor: string;
  }>({
    logo: null,
    bannerColor: "#f5f5f5",
    primaryColor: "#000000",
  });

  return (
    <div className=" p-4 max-h-screen h-screen overflow-y-auto flex gap-4 flex-col md:flex-row">
      <div className="w-full md:w-1/2 py-4 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="flex justify-between items-center">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <div className="text-xl font-bold flex justify-start items-start flex-col">
                Sua Marca
                <div className="text-sm font-thin text-gray-500">
                  ({company?.name})
                </div>
              </div>
            </>
          )}

          {/* 
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            className={`rounded-full ${
              !isDirty
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "opacity-100"
            }`}
          >
            {isSubmitting ? "Enviando..." : "Salvar"}
          </Button> */}
        </div>
        <Separator className="my-4" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />{" "}
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

          <Card>
            <CardContent className="p-0 relative">
              <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                <div className="border-2 rounded-full border-gray-300 p-2 shadow-md">
                  <GiBurningTree className="size-6" />
                </div>
                <Button
                  variant="outline"
                  className="absolute bottom-2 right-2 rounded-md shadow-sm"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload banner image
                </Button>
              </div>
            </CardContent>
          </Card>
          <BrandLogoUpload
            logo={previewConfig.logo}
            onUploadLogo={base64 =>
              setPreviewConfig(prev => ({ ...prev, logo: base64 }))
            }
            onRemoveLogo={() =>
              setPreviewConfig(prev => ({ ...prev, logo: null }))
            }
          />

          {/* <Separator className="my-4" />
          <BusinessInfoFields
            register={register}
            error={errors.name?.message}
            name={company?.name || ""}
            taxId={company?.tax_id || ""}
            loading={loading}
          /> */}
        </form>
      </div>
      <div className=" w-full md:w-1/2  rounded-md shadow-sm ">
        <PreviewLayout config={previewConfig} />
      </div>
    </div>
  );
}
