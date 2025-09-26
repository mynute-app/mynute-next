"use client";

import { useMemo } from "react";
import { useCompanyByName } from "@/hooks/use-company-by-name";
import { ServiceList } from "@/app/(home)/_components/service-list";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { company, loading, error } = useCompanyByName();

  const services = useMemo(() => company?.services ?? [], [company]);
  const brandColor = company?.design?.colors?.primary || undefined;

  return (
    <div className="h-[100dvh] overflow-auto">
      <section className="relative w-full h-40 md:h-48 lg:h-56 overflow-hidden bg-background ">
        {company?.design?.images?.banner?.url ? (
          <Image
            src={company.design.images.banner.url || "/placeholder.svg"}
            alt="Banner da empresa"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: company?.design?.colors?.primary || "#3B82F6",
            }}
          />
        )}

        {/* Scrim para melhor contraste */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Logo centralizado */}
        <div className="absolute inset-0 flex items-center justify-center">
          {loading ? (
            <Skeleton className="h-16 w-24 md:h-24 md:w-36 rounded-md" />
          ) : company?.design?.images?.logo?.url ? (
            <div className="relative h-16 w-28 md:h-24 md:w-40 bg-white/20 rounded-md ">
              <Image
                src={company.design.images.logo.url || "/placeholder.svg"}
                alt="Logo da empresa"
                fill
                className="object-contain drop-shadow-md"
                sizes="(max-width: 768px) 112px, 160px"
                priority
              />
            </div>
          ) : (
            <Skeleton className="h-16 w-24 md:h-24 md:w-36 rounded-md" />
          )}
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-2">
        <ServiceList
          services={services as any[]}
          loading={loading}
          error={error ?? undefined}
          brandColor={brandColor}
          companyId={company?.id}
        />
      </div>
    </div>
  );
}
