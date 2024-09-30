import { useWizardStore } from "@/context/useWizardStore";
import { CardCustom } from "../custom/Card-Custom";

export const PersonStep = () => {
  const { setSelectedPerson, selectedPerson } = useWizardStore();
  const handleSelectPerson = (person: string) => {
    setSelectedPerson(person);
  };
  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
      <CardCustom
        title="Qualquer profissional"
        onClick={() => handleSelectPerson("person1")}
        isSelected={selectedPerson === "person1"}
      />
      <CardCustom
        title="Vitor"
        description="Tatto"
        onClick={() => handleSelectPerson("person2")}
        isSelected={selectedPerson === "person2"}
      />
      <CardCustom
        title="Luan"
        description="Tatto"
        onClick={() => handleSelectPerson("person3")}
        isSelected={selectedPerson === "person3"}
      />
    </div>
  );
};
