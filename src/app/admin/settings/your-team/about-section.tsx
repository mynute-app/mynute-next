import { ClockIcon, LinkIcon, MailIcon, PhoneIcon } from "lucide-react";
import { TeamMember } from "../../../../../types/TeamMember";

interface AboutSectionProps {
  selectedMember: TeamMember | null;
}

export function AboutSection({ selectedMember }: AboutSectionProps) {
  if (!selectedMember) {
    return <p className="text-gray-500">Nenhum membro selecionado</p>;
  }

  return (
    <div className="space-y-4 p-4 bg-white ">
      {/* Nome e Cargo */}
      <div>
        <h2 className="text-xl font-semibold ">
          {selectedMember.name} {selectedMember.surname}
        </h2>
        <p className="text-gray-500 capitalize">
          Permisão: {selectedMember.role || "Role não informada"}
        </p>
      </div>

      {/* Telefone */}
      {selectedMember.phone ? (
        <div className="flex items-center space-x-2">
          <PhoneIcon className="w-5 h-5 text-gray-500" />
          <span>{selectedMember.phone}</span>
        </div>
      ) : (
        <div className="text-gray-500">Telefone não informado</div>
      )}

      {/* Email */}
      {selectedMember.email ? (
        <div className="flex items-center space-x-2">
          <MailIcon className="w-5 h-5 text-gray-500" />
          <span>{selectedMember.email}</span>
        </div>
      ) : (
        <div className="text-gray-500">E-mail não informado</div>
      )}

      {/* Horário fixo */}
      <div className="flex items-center space-x-2">
        <ClockIcon className="w-5 h-5 text-gray-500" />
        <span>Hoje • 9:00 AM - 5:00 PM (HPDB)</span>
      </div>
    </div>
  );
}
