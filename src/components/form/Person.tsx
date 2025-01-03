import { useRouter } from "next/navigation";
import { useWizardStore } from "@/context/useWizardStore";
import { CardCustomProfile } from "../custom/Card-Custom-Profile";
import { useFetch } from "@/data/loader";

type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  permission: string;
};

export const PersonStep = () => {
  const { setSelectedPerson, selectedPerson } = useWizardStore();
  const router = useRouter();

  const {
    data: teamMembers,
    loading,
    error,
  } = useFetch<TeamMember[]>("/team-members");

  const handleSelectPerson = (personName: string) => {
    setSelectedPerson(personName);
    const params = new URLSearchParams(window.location.search);
    params.set("person", personName);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="h-20 md:h-32 w-full bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Erro ao carregar membros da equipe</div>
    );
  }

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar p-2 ">
      {teamMembers?.map(member => (
        <CardCustomProfile
          key={member.id}
          title={member.fullName}
          description={member.permission}
          onClick={() => handleSelectPerson(member.fullName)}
          isSelected={selectedPerson === member.fullName}
        />
      ))}
    </div>
  );
};
