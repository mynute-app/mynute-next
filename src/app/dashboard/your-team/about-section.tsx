"use client";

import { ClockIcon, MailIcon, PhoneIcon } from "lucide-react";
import { TeamMember } from "../../../../types/TeamMember";

const traduzirDia = (diaIngles: string): string => {
  const mapa: Record<string, string> = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return mapa[diaIngles] || diaIngles;
};

export function AboutSection({
  selectedMember,
}: {
  selectedMember: any | null;
}) {
  if (!selectedMember) {
    return <p className="text-gray-500">Nenhum membro selecionado</p>;
  }

  return (
    <div className="space-y-4 p-4 bg-white">
      {/* Nome e Cargo */}
      <div>
        <h2 className="text-xl font-semibold">
          {selectedMember.name} {selectedMember.surname}
        </h2>
        <p className="text-gray-500 capitalize">
          Permissão: {selectedMember.role || "Não informada"}
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

      {/* Jornada de trabalho */}
      {selectedMember?.work_schedule ? (
        <div>
          <h3 className="flex items-center gap-2 font-medium text-sm text-gray-700 mb-1">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            Jornada de trabalho
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {Object.entries(selectedMember.work_schedule).map(
              ([dia, value]) => {
                const horarios = value as { start: string; end: string }[];

                if (!horarios || !horarios.length) return null;

                return (
                  <li key={dia}>
                    <span className="capitalize font-semibold">
                      {traduzirDia(dia)}:
                    </span>{" "}
                    {horarios.map(h => `${h.start} - ${h.end}`).join(", ")}
                  </li>
                );
              }
            )}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">Jornada de trabalho não definida</p>
      )}
    </div>
  );
}
