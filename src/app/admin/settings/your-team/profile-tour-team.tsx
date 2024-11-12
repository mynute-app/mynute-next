"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import AddTeamMemberDialog from "./add-team-member-modal";
import { MdOutlineModeEdit } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import { BreaksSection } from "./breakssection";
import { WorkingHoursSection } from "./working-hours-section";
import { ServicesSection } from "./services-section";
import { IntegrationsSection } from "./integration-button";
import { AboutSection } from "./about-section";
import { useSession } from "next-auth/react";
import TeamMemberActions from "./team-member-actions";

type TeamMember = {
  id: number;
  fullName: string;
  email: string;
  permission: string;
};

export default function YourTeam() {
  const { data: session } = useSession(); // Acessa dados do usuário logado
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("http://localhost:3333/team-members");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setTeamMembers(data);
          } else {
            console.error(
              "Erro: Dados de membros da equipe não estão no formato de array."
            );
          }
        } else {
          console.error("Erro ao buscar os membros da equipe");
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };
    fetchTeamMembers();
  }, []);

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setActiveTab("about");
  };

  const handleDeleteMember = (member: TeamMember | null) => {
    if (member) {
      // Lógica para deletar o membro da equipe
      console.log(`Deleting member: ${member.fullName}`);
    }
  };

  const handleSaveMember = (updatedUser: TeamMember) => {
    // Lógica para salvar o membro da equipe
    console.log(`Saving member: ${updatedUser.fullName}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <AboutSection
            selectedMember={
              selectedMember || {
                id: 0,
                fullName: session?.user?.name || "Logged-in User",
                email: session?.user?.email || "No email provided",
                permission: "Logged-in User",
              }
            }
          />
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
          <h2 className="text-lg font-semibold">Your Team</h2>
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
          {session && (
            <li
              className={`p-2 rounded cursor-pointer ${
                selectedMember?.id === 0 ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() =>
                setSelectedMember({
                  id: 0,
                  fullName: session.user?.name || "Logged-in User",
                  email: session.user?.email || "No email provided",
                  permission: "Logged-in User",
                })
              }
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center font-bold text-gray-700">
                  {session.user?.name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium">
                    {session.user?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">Logged-in User</p>
                </div>
              </div>
            </li>
          )}

          {/* Team List */}
          {teamMembers.map(member => (
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
                <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center font-bold text-gray-700">
                  {member.fullName ? member.fullName[0] : "?"}
                </div>
                <div>
                  <p className="font-medium">{member.fullName || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{member.permission}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail View */}
      <div className="w-2/3 p-6">
        {selectedMember || session ? (
          <>
            <div className="flex items-center justify-between space-x-4 mb-6">
              <div className="flex justify-center items-start gap-4">
                <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center text-xl font-bold">
                  {selectedMember?.fullName?.[0] ||
                    session?.user?.name?.[0] ||
                    "?"}
                </div>
                <div className="flex justify-start items-center flex-col mt-2">
                  <h1 className="text-2xl font-semibold">
                    {selectedMember?.fullName ||
                      session?.user?.name ||
                      "Unknown"}
                  </h1>
                  <p className="text-gray-500">
                    {selectedMember?.permission || "Logged-in User"}
                  </p>
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
                About
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
          <p>Select a team member to view details</p>
        )}
      </div>

      {/* Dialog for Adding Team Member */}
      <AddTeamMemberDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
