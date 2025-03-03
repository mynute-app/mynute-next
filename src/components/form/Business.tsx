import { useRouter } from "next/navigation";
import { CardCustom } from "@/components/custom/Card-Custom";
import { useWizardStore } from "@/context/useWizardStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCompany } from "@/hooks/get-one-company";

type CompanyType = {
  id: string;
  name: string;
};

export const BusinessStep = () => {
  const { setSelectedBusiness, selectedBusiness } = useWizardStore();
  const companyId = 1;
  const { company, loading } = useGetCompany(companyId);

  const router = useRouter();

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusiness(businessId);
    const params = new URLSearchParams(window.location.search);
    params.set("businessId", businessId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading || !company) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-20 md:h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-auto overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
      {company.company_types?.map((type: CompanyType) => (
        <CardCustom
          key={type.id}
          title={type.name}
          description={company.name}
          onClick={() => handleSelectBusiness(company.id)}
          isSelected={selectedBusiness === company.id}
        />
      ))}
    </div>
  );
};
