"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import PreviewLayout from "./preview-layout";
import { CompanyDesignDisplay } from "@/components/dashboard/CompanyDesignDisplay";
import { useGetCompany } from "@/hooks/get-company";
import YourBrandSkeleton from "./your-brand-skeleton";
import YourBrandError from "./your-brand-error";
import YourBrandUploadForm from "./your-brand-upload-form";

export default function YourBrand() {
  const { company, loading: loadingCompany, error } = useGetCompany();

  const handleRetry = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (company) {
      console.log("✅ Dados da empresa carregados:", company);
    }
  }, [company]);

  if (loadingCompany) {
    return <YourBrandSkeleton />;
  }

  if (error) {
    return <YourBrandError error={error} onRetry={handleRetry} />;
  }

  if (!company) {
    return <div className="text-gray-500">Empresa não encontrada.</div>;
  }

  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex gap-4 flex-col md:flex-row">
      <div className="w-full md:w-1/2 py-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold flex flex-col">
            Sua Marca
            <span className="text-sm font-thin text-gray-500">
              {company.legal_name || company.name}
              <span className="ml-2">(ID: {company.id})</span>
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <YourBrandUploadForm
          company={company}
          onUploadSuccess={() => {
            console.log("Upload realizado com sucesso!");
          }}
        />
      </div>{" "}
      <div className="w-full md:w-1/2 rounded-md shadow-sm">
        <PreviewLayout
          config={{
            logo: company?.design?.images?.logo?.url || "",
            bannerImage: company?.design?.images?.banner?.url || "",
            bannerColor: company?.design?.colors?.secondary || "#FFFFFF",
            primaryColor: company?.design?.colors?.primary || "#000000",
            dark_mode: false,
          }}
        />
        <div className="mt-6 p-4">
          <h3 className="text-lg font-semibold mb-4">
            Detalhes do Design Atual
          </h3>
          {/* <CompanyDesignDisplay companyId={company?.id} /> */}
        </div>
      </div>
    </div>
  );
}
