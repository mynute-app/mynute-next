import { useWizardStore } from "@/context/useWizardStore";
import { CardService } from "../custom/Card-Service"

export const ServiceStep = () => {
    const { setSelectedService, selectedService } = useWizardStore();
    const handleSelectService = (service: string) => {
        setSelectedService(service);
    }
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
        <CardService
          title="Service 1"
          subtitle="Service Description"
          price="$100"
          duration="1 hr"
          iconSrc="/path/to/icon"
          onClick={() => handleSelectService("service1")}
          isSelected={selectedService === "service1"}
        />

        <CardService
          title="Service 1"
          subtitle="Service Description"
          price="$100"
          duration="1 hr"
          iconSrc="/path/to/icon"
          onClick={() => handleSelectService("service2")}
          isSelected={selectedService === "service2"}
        />

        <CardService
          title="Service 1"
          subtitle="Service Description"
          price="$100"
          duration="1 hr"
          iconSrc="/path/to/icon"
          onClick={() => handleSelectService("service3")}
          isSelected={selectedService === "service3"}
        />

        <CardService
          title="Service 1"
          subtitle="Service Description"
          price="$100"
          duration="1 hr"
          iconSrc="/path/to/icon"
          onClick={() => handleSelectService("service4")}
          isSelected={selectedService === "service4"}
        />
      </div>
    );
}