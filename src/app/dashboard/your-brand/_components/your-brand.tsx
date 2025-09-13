"use client";

import { Separator } from "@/components/ui/separator";
import { useGetCompany } from "@/hooks/get-company";
import YourBrandSkeleton from "./your-brand-skeleton";
import YourBrandUploadForm from "./your-brand-upload-form";

export default function YourBrand() {
  const { company, loading: loadingCompany } = useGetCompany();

  if (loadingCompany) {
    return <YourBrandSkeleton />;
  }

  if (!company) {
    return <div className="text-gray-500">Empresa não encontrada.</div>;
  }

  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex gap-4 flex-col ">
      <div className="w-full md:w-3/4 py-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 mx-auto">
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

        <YourBrandUploadForm company={company} />
      </div>
    </div>
  );
}
