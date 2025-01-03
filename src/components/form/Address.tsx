import { useRouter } from "next/navigation";
import { CardCustomAddress } from "../custom/Card-Custom-Address";
import { useWizardStore } from "@/context/useWizardStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/data/loader";

type Address = {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  businessName: string;
};

export const AddressStep = () => {
  const { setSelectedAddress, selectedAddress } = useWizardStore();
  const router = useRouter();

  const { data: businesses, loading, error } = useFetch<any[]>("/business");

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    const params = new URLSearchParams(window.location.search);
    params.set("addressId", addressId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 pr-2 md:pr-6">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-20 md:h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const addresses: Address[] =
    businesses?.map(business => ({
      id: business.id,
      address: business.location.address,
      city: business.location.city,
      state: business.location.state,
      zipCode: business.location.zipCode,
      businessName: business.businessName,
    })) || [];

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
      {addresses.map(address => (
        <CardCustomAddress
          key={address.id}
          title={`${address.address}`}
          subTitle={`${address.city}/ ${address.state} - ${address.zipCode}`}
          description={` (${address.businessName})`}
          onClick={() => handleSelectAddress(address.id)}
          isSelected={selectedAddress === address.id}
        />
      ))}
    </div>
  );
};
