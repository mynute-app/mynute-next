import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardCustom } from "@/components/custom/Card-Custom";
import { useWizardStore } from "@/context/useWizardStore";
import { Skeleton } from "@/components/ui/skeleton";

type Address = {
  id: string;
  title: string;
  description: string;
};

export const AddressStep = () => {
  const { setSelectedAddress, selectedAddress } = useWizardStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3333/addresses");
        if (!response.ok) throw new Error("Erro ao buscar endereços");

        const data = await response.json();
        setAddresses(data);
      } catch (err) {
        setError("Erro ao carregar endereços.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    const params = new URLSearchParams(window.location.search);
    params.set("addressId", addressId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
        {[...Array(8)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
      {addresses.map(address => (
        <CardCustom
          key={address.id}
          title={address.title}
          description={address.description}
          onClick={() => handleSelectAddress(address.id)}
          isSelected={selectedAddress === address.id} 
        />
      ))}
    </div>
  );
};
