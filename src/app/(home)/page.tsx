"use client";

import { useMemo } from "react";
import { useGetCompany } from "@/hooks/get-company";
import { ServiceList } from "@/app/(home)/_components/service-list";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { company, loading, error } = useGetCompany();

  const services = useMemo(() => company?.services ?? [], [company]);

  return (
    <div>
      {/* Banner + Logo da Empresa */}
      <section className="relative w-full h-40 md:h-56 lg:h-64 mb-6 overflow-hidden">
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
            <div className="relative h-16 w-28 md:h-24 md:w-40">
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
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Explore e selecione um serviço para continuar o agendamento.
          </p>
        </header>

        <ServiceList
          services={services}
          loading={loading}
          error={error ?? undefined}
        />
      </div>
    </div>
  );
}
