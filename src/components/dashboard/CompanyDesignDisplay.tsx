import React from "react";
import { useGetCompanyDesign } from "@/hooks/useGetCompanyDesign";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CompanyDesignDisplayProps = {
  companyId?: string;
};

export function CompanyDesignDisplay({ companyId }: CompanyDesignDisplayProps) {
  const { design, loading, error } = useGetCompanyDesign({ companyId });

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-[250px]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">
            Erro ao carregar design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!design) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Design da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhuma informação de design encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Design da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          {design.logo && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Logo</h3>
              <div className="relative h-40 w-40">
                <Image
                  src={design.logo}
                  alt="Logo da empresa"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Banner */}
          {design.banner && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Banner</h3>
              <div className="relative h-40 w-full">
                <Image
                  src={design.banner}
                  alt="Banner da empresa"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>
          )}

          {/* Favicon */}
          {design.favicon && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Favicon</h3>
              <div className="relative h-12 w-12">
                <Image
                  src={design.favicon}
                  alt="Favicon da empresa"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Background */}
          {design.background && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Imagem de fundo</h3>
              <div className="relative h-40 w-full">
                <Image
                  src={design.background}
                  alt="Imagem de fundo"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </div>
          )}

          {/* Cores */}
          {design.colors && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Cores da marca</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {design.colors.primary && (
                  <ColorBox
                    color={design.colors.primary}
                    label="Cor primária"
                  />
                )}
                {design.colors.secondary && (
                  <ColorBox
                    color={design.colors.secondary}
                    label="Cor secundária"
                  />
                )}
                {design.colors.tertiary && (
                  <ColorBox
                    color={design.colors.tertiary}
                    label="Cor terciária"
                  />
                )}
                {design.colors.quaternary && (
                  <ColorBox
                    color={design.colors.quaternary}
                    label="Cor quaternária"
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ColorBox({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="h-12 w-12 rounded-md border"
        style={{ backgroundColor: color }}
      ></div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs font-mono">{color}</p>
    </div>
  );
}
