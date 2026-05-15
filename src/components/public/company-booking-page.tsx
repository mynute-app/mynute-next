import { ServiceList } from "@/app/(home)/_components/service-list";
import Image from "next/image";
import type { Company } from "@/lib/subdomain-validation";

type CompanyBookingPageProps = {
  company: Company;
};

export function CompanyBookingPage({ company }: CompanyBookingPageProps) {
  const services = company?.services ?? [];
  const employees = (company?.employees ?? []).filter(e => e.is_active !== false);
  const branches = company?.branches ?? [];
  const brandColor = company?.design?.colors?.primary || undefined;

  return (
    <div className="booking-page h-[100dvh] overflow-auto bg-background">
      {/* Hero Banner */}
      <section className="relative h-44 w-full overflow-hidden md:h-56 lg:h-64">
        {company?.design?.images?.banner?.url ? (
          <Image
            src={company.design.images.banner.url}
            alt="Banner da empresa"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: brandColor
                ? `linear-gradient(135deg, ${brandColor}ee, ${brandColor}99)`
                : "linear-gradient(135deg, #1e3a5f, #2563eb)",
            }}
          />
        )}

        {/* Overlay gradiente no rodapé para transição suave com o fundo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Logo centrada */}
        {company?.design?.images?.logo?.url ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
            <div className="relative h-14 w-24 rounded-xl overflow-hidden bg-white/90 shadow-lg ring-2 ring-white/50 md:h-20 md:w-36">
              <Image
                src={company.design.images.logo.url}
                alt="Logo da empresa"
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 96px, 144px"
                priority
              />
            </div>
          </div>
        ) : (
          /* Sem logo: mostrar nome da empresa no banner */
          <div className="absolute inset-0 flex items-end justify-start px-4 pb-4 md:items-center md:justify-center md:pb-0">
            <h1 className="text-xl font-bold text-white drop-shadow-md md:text-3xl">
              {company?.trading_name || company?.legal_name}
            </h1>
          </div>
        )}
      </section>

      {/* Conteúdo principal */}
      <div className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
        <ServiceList
          services={services}
          employees={employees}
          branches={branches}
          loading={false}
          error={undefined}
          brandColor={brandColor}
          companyId={company?.id}
        />
      </div>
    </div>
  );
}
