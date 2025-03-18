"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import AddTeamMemberDialog from "./add-team-member-modal";
import { BreaksSection } from "./breakssection";
import { WorkingHoursSection } from "./working-hours-section";
import { ServicesSection } from "./services-section";
import { IntegrationsSection } from "./integration-button";
import { AboutSection } from "./about-section";
import { useSession } from "next-auth/react";
import TeamMemberActions from "./team-member-actions";
import { useGetCompany } from "@/hooks/get-one-company";
import { TeamMember } from "../../../../../types/TeamMember";
import { Skeleton } from "@/components/ui/skeleton";
import MemberPlaceholder from "./member-placeholder";

export default function YourTeam() {
  const { data: session } = useSession();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const companyId = 1;
  const { company, loading } = useGetCompany(companyId);

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setActiveTab("about");
  };

  const handleDeleteMember = (member: TeamMember | null) => {
    if (member) {
      // Lógica para deletar o membro da equipe
      console.log(`Deleting member: ${member.name}`);
    }
  };

  const handleSaveMember = (updatedUser: TeamMember) => {
    // Lógica para salvar o membro da equipe
    console.log(`Saving member: ${updatedUser.name}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return selectedMember ? (
          <AboutSection
            selectedMember={
              selectedMember || {
                id: 0,
                name: company?.employees?.name,
                surname: company?.employees?.surname,
                email: company?.employees?.email,
                phone: company?.employees?.phone,
                permission: company?.employees?.role,
              }
            }
          />
        ) : (
          <p>Selecione um membro para ver os detalhes</p>
        );
      case "integrations":
        return <IntegrationsSection />;
      case "services":
        return <ServicesSection />;
      case "working-hours":
        return <WorkingHoursSection />;
      case "breaks":
        return <BreaksSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 p-4 border-r">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meu time</h2>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 pl-10 rounded border border-gray-300"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
        </div>

        <ul className="space-y-2">
          {/* Verifica se ainda está carregando */}
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <li
                  key={index}
                  className="p-2 rounded cursor-pointer bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {/* Skeleton para o avatar */}
                    <Skeleton className="rounded-full bg-gray-300 w-8 h-8" />

                    {/* Skeleton para nome e cargo */}
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </li>
              ))
            : company?.employees?.map((member: any) => (
                <li
                  key={member.id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedMember?.id === member.id
                      ? "bg-gray-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectMember(member)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar com a primeira letra do nome */}
                    <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center font-bold text-gray-700">
                      {member.name ? member.name[0] : "?"}
                    </div>
                    {/* Informações do funcionário */}
                    <div>
                      <p className="font-medium">
                        {member.name} {member.surname}
                      </p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </li>
              ))}
        </ul>
      </div>

      {/* Detail View */}
      <div className="w-2/3 p-6 ">
        {selectedMember ? (
          <>
            <div className="flex items-center justify-between space-x-4 mb-6">
              <div className="flex justify-center items-start gap-4">
                <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center text-xl font-bold">
                  {selectedMember?.name?.[0]}
                </div>
                <div className="flex justify-start items-start flex-col mt-2">
                  <h1 className="text-2xl font-semibold">
                    {selectedMember?.name} {selectedMember?.surname}
                  </h1>
                </div>
              </div>

              <TeamMemberActions
                selectedMember={selectedMember}
                onDelete={() => handleDeleteMember(selectedMember)}
                onSave={updatedUser => handleSaveMember(updatedUser)}
              />
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mt-4 mb-4">
              <button
                onClick={() => setActiveTab("about")}
                className={`py-2 ${
                  activeTab === "about" ? "border-b-2 border-black" : ""
                }`}
              >
                Sobre
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`py-2 ${
                  activeTab === "integrations" ? "border-b-2 border-black" : ""
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`py-2 ${
                  activeTab === "services" ? "border-b-2 border-black" : ""
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab("working-hours")}
                className={`py-2 ${
                  activeTab === "working-hours" ? "border-b-2 border-black" : ""
                }`}
              >
                Working hours
              </button>
              <button
                onClick={() => setActiveTab("breaks")}
                className={`py-2 ${
                  activeTab === "breaks" ? "border-b-2 border-black" : ""
                }`}
              >
                Breaks
              </button>
            </div>

            <div>{renderTabContent()}</div>
          </>
        ) : (
          <MemberPlaceholder />
        )}
      </div>

      {/* Dialog for Adding Team Member */}
      <AddTeamMemberDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
