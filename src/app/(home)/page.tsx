import { useSubdomainValidation } from "@/hooks/use-subdomain-validation";
import { ServiceList } from "@/app/(home)/_components/service-list";
import { LandingPage } from "@/components/custom/landing-page";
import Image from "next/image";

export default async function Page() {
  const { company, errorComponent, isMainDomain } =
    await useSubdomainValidation();

  // Se for o domínio principal (mynute.app ou localhost), mostra a landing page
  if (isMainDomain) {
    return <LandingPage />;
  }

  if (errorComponent) {
    return errorComponent;
  }

  if (!company) {
    return null;
  }

  const services = company?.services ?? [];
  const employees = company?.employees ?? [];
  const branches = company?.branches ?? [];
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
          {company?.design?.images?.logo?.url ? (
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
          ) : null}
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-2">
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
