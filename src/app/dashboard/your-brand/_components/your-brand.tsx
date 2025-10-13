"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Image, Building2 } from "lucide-react";
import { useGetCompany } from "@/hooks/get-company";
import YourBrandSkeleton from "./your-brand-skeleton";
import YourBrandUploadForm from "./your-brand-upload-form";
import BrandAppearanceSettings from "./BrandAppearanceSettings";
import BusinessInfoSection from "./business-info-section";

export default function YourBrand() {
  const { company, loading: loadingCompany } = useGetCompany();
  const [activeTab, setActiveTab] = useState("images");

  if (loadingCompany) {
    return <YourBrandSkeleton />;
  }

  if (!company) {
    return <div className="text-gray-500">Empresa não encontrada.</div>;
  }

  return (
    <div className="flex h-[90vh] gap-4 p-4">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        {/* Header Card */}
        <div className="bg-white rounded-lg border-2 p-4 space-y-1">
          <h1 className="text-2xl font-bold">Sua Marca</h1>
          <p className="text-sm text-muted-foreground">
            {company.legal_name || company.name}
          </p>
          <p className="text-xs text-muted-foreground">ID: {company.id}</p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Personalize sua marca
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure a identidade visual da sua empresa: adicione logo, banner,
            escolha cores e defina o tema da sua página de agendamento.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg border-2 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="border-b px-6 pt-4">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0">
              <TabsTrigger
                value="images"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                <Image className="w-4 h-4" />
                Imagens
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                <Palette className="w-4 h-4" />
                Aparência
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
              >
                <Building2 className="w-4 h-4" />
                Informações
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <TabsContent value="images" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Imagens da Marca</h2>
                  <p className="text-sm text-muted-foreground">
                    Adicione ou atualize as imagens da sua marca que serão
                    exibidas na página de agendamento.
                  </p>
                </div>
                <YourBrandUploadForm company={company} />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    Configurações de Aparência
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Personalize cores, temas e estilos da sua página de
                    agendamento.
                  </p>
                </div>
                <BrandAppearanceSettings />
              </TabsContent>

              <TabsContent value="business" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    Informações do Negócio
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie as informações da sua empresa, endereços e
                    contatos.
                  </p>
                </div>
                <BusinessInfoSection company={company} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
