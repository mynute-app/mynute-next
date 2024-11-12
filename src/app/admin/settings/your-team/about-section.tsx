import { ClockIcon, LinkIcon, MailIcon, PhoneIcon } from "lucide-react";
import { TeamMember } from "../../../../../types/TeamMember";
import { useSession } from "next-auth/react";

export function AboutSection({
  selectedMember,
}: {
  selectedMember: TeamMember | null;
}) {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      {/* Nome do usuário logado */}
      {session?.user?.name && (
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Nome:</span>
          <span>{session.user.name}</span>
        </div>
      )}

      {/* E-mail do usuário logado */}
      {session?.user?.email && (
        <div className="flex items-center space-x-2">
          <MailIcon className="w-5 h-5 text-gray-500" />
          <span>{session.user.email}</span>
        </div>
      )}

      {/* Dados do membro da equipe selecionado */}
      {selectedMember && (
        <>
          <div className="flex items-center space-x-2">
            <PhoneIcon className="w-5 h-5 text-gray-500" />
            <span>(11) 97135-1731</span>
          </div>
          <div className="flex items-center space-x-2">
            <MailIcon className="w-5 h-5 text-gray-500" />
            <span>{selectedMember.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <span>Today • 9:00 AM - 5:00 PM (HPDB)</span>
          </div>
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-5 h-5 text-gray-500" />
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://example.com
            </a>
          </div>
        </>
      )}
    </div>
  );
}
