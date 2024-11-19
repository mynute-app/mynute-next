import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/context/useWizardStore";
import { CardCustom } from "../custom/Card-Custom";

type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  permission: string;
};

export const PersonStep = () => {
  const { setSelectedPerson, selectedPerson } = useWizardStore();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const router = useRouter();

  // Fetch team members data from JSON server
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("http://localhost:3333/team-members");
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data);
        } else {
          console.error("Failed to fetch team members");
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleSelectPerson = (personName: string) => {
    setSelectedPerson(personName);
    const params = new URLSearchParams(window.location.search);
    params.set("person", personName);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pr-2 md:pr-6 custom-scrollbar">
      <CardCustom
        title="Qualquer profissional"
        onClick={() => handleSelectPerson("Qualquer profissional")}
        isSelected={selectedPerson === "Qualquer profissional"}
      />
      {teamMembers.map(member => (
        <CardCustom
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
