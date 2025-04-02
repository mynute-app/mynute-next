import { useRouter } from "next/navigation";
import { CardCustomAddress } from "../custom/Card-Custom-Address";
import { useWizardStore } from "@/context/useWizardStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCompany } from "@/hooks/get-one-company";
import { useCompany } from "@/hooks/get-company";

type Branch = {
  id: string;
  name: string;
  company_id: string;
};

export const AddressStep = () => {
  const { setSelectedAddress, selectedAddress } = useWizardStore();
  const router = useRouter();
  const { company, loading } = useCompany();
  console.log(company);
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    const params = new URLSearchParams(window.location.search);
    params.set("addressId", addressId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading || !company) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 pr-2 md:pr-6">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-20 md:h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-auto overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
      {company.branches?.map((branch: any) => (
        <CardCustomAddress
          key={branch.id}
          title={branch.name}
          subTitle={`${branch.street}, ${branch.number} - ${branch.neighborhood}`}
          description={`${branch.city} / ${branch.state} - ${branch.zip_code}`}
          extraInfo={`País: ${branch.country}`}
          onClick={() => handleSelectAddress(branch.id)}
          isSelected={selectedAddress === branch.id}
        />
      ))}
    </div>
  );
};
