"use client";

import { useGetCompany } from "@/hooks/get-company";
import YourBrandSkeleton from "./your-brand-skeleton";
import YourBrandUploadForm from "./your-brand-upload-form";
import BusinessInfoSection from "./business-info-section";
import BrandColorsSection from "./brand-colors-section";

export default function YourBrand() {
  const { company, loading: loadingCompany } = useGetCompany();

  if (loadingCompany) {
    return <YourBrandSkeleton />;
  }

  if (!company) {
    return <div className="text-gray-500">Empresa nao encontrada.</div>;
  }
  return (
    <div className="branding-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-8 pt-12 lg:pt-0">
            <div className="page-header">
              <h1 className="page-title">Branding & Midias</h1>
              <p className="page-description">
                Personalize a identidade visual do seu negocio
              </p>
            </div>

            <YourBrandUploadForm company={company} />
            {/* <BrandColorsSection
              companyId={company.id}
              initialColors={company.design?.colors}
            /> */}
            <BusinessInfoSection company={company} />
          </div>
        </div>
      </div>
    </div>
  );
}
