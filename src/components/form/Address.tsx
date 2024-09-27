import { CardCustom } from "@/components/custom/Card-Custom";
import { useWizardStore } from "@/context/useWizardStore";

export const Address: React.FC = () => {
  const { setSelectedAddress, selectedAddress } = useWizardStore();

  const handleSelectAddress = (address: string) => {
    setSelectedAddress(address);
  };

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
      <CardCustom
        title="Lá Família"
        description="São Roque"
        onClick={() => handleSelectAddress("address1")}
        isSelected={selectedAddress === "address1"}
      />
      <CardCustom
        title="Casa do João"
        description="São Paulo"
        onClick={() => handleSelectAddress("address2")}
        isSelected={selectedAddress === "address2"}
      />
    </div>
  );
};
