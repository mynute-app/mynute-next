import { useRouter } from "next/navigation";
import { useWizardStore } from "@/context/useWizardStore";
import { CardCustomProfile } from "../custom/Card-Custom-Profile";
import { useGetCompany } from "@/hooks/get-one-company";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

export const PersonStep = () => {
  const { setSelectedPerson, selectedPerson } = useWizardStore();
  const router = useRouter();

  const companyId = 1;
  const { company, loading } = useGetCompany(companyId);

  const handleSelectPerson = (personId: number) => {
    const personIdStr = String(personId);
    setSelectedPerson(personIdStr);
    const params = new URLSearchParams(window.location.search);
    params.set("person", personIdStr);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-40 w-full bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-auto overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
      {company.employees?.map((member: TeamMember) => (
        <CardCustomProfile
          key={member.id}
          title={member.name}
          description={member.email}
          onClick={() => handleSelectPerson(member.id)}
          isSelected={selectedPerson === String(member.id)} // Convertendo para string na comparação
        />
      ))}
    </div>
  );
};
