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
import { TeamMember } from "../../../../types/TeamMember";
import { Skeleton } from "@/components/ui/skeleton";
import MemberPlaceholder from "./member-placeholder";
import { Employee } from "../../../../types/company";
import { Input } from "@/components/ui/input";
import { useCompany } from "@/hooks/get-company";
import { TeamMemberList } from "./team-member-list";
import { useGetEmployeeById } from "@/hooks/get-employee-by-id";

export default function YourTeam() {
  //const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { company, loading } = useCompany();
  const employees: Employee[] = company?.employees ?? [];
  console.log(employees);

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const { employee: selectedEmployeeData, loading: loadingEmployee } =
    useGetEmployeeById(selectedMemberId);

  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Atualiza selectedMember sempre que mudar o dado do hook
  useEffect(() => {
    if (selectedEmployeeData) {
      setSelectedMember(selectedEmployeeData);
    }
  }, [selectedEmployeeData]);

  const handleSelectMember = (id: number) => {
    setSelectedMemberId(id);
    setActiveTab("about");
  };

  const handleDeleteMember = (member: any | null) => {
    if (member) {
      console.log(`Deleting member: ${member.name}`);
    }
  };

  const handleSaveMember = (updatedUser: TeamMember) => {
    console.log(`Saving member: ${updatedUser.name}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return selectedMember ? (
          <AboutSection selectedMember={selectedMember} />
        ) : (
          <p>Selecione um membro para ver os detalhes</p>
        );
      case "integrations":
        return <IntegrationsSection />;
      case "services":
        return (
          <ServicesSection
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
          />
        );
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
      <div className="w-1/3  p-4 border-r">
        <div className="flex items-center justify-between mb-4">
          <h2 className=" font-semibold">Meu time</h2>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon />
          </Button>
        </div>

        <TeamMemberList
          employees={employees}
          loading={loading}
          selectedMember={selectedMember}
          onSelectMember={member => handleSelectMember(member.id)}
        />
      </div>

      {/* Detail View */}
      <div className="w-2/3 p-6">
        {loadingEmployee ? (
          // Loading state
          <div className="flex flex-col space-y-4">
            <Skeleton className="w-32 h-8" />
            <Skeleton className="w-full h-24" />
          </div>
        ) : selectedMember ? (
          // Dados do funcionário carregados
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
          // Nenhum membro selecionado
          <div className="text-gray-500">
            Selecione um membro para ver os detalhes
          </div>
        )}
      </div>

      {/* Dialog for Adding Team Member */}
      <AddTeamMemberDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
