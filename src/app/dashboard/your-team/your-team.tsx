"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  User,
  Briefcase,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import AddTeamMemberDialog from "./add-team-member-modal";
import { Branch } from "./branch-section";
import { ServicesSection } from "./services-section";
import { WorkRangeServicesSection } from "./work-range-services-section";
import { AboutSection } from "./about-section";
import TeamMemberActions from "./team-member-actions";
import { TeamMember } from "../../../../types/TeamMember";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee } from "../../../../types/company";
import { WorkScheduleManager } from "@/components/work-schedule";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TeamMemberList } from "./team-member-list";
import { useGetEmployeeById } from "@/hooks/get-employee-by-id";
import { useGetCompany } from "@/hooks/get-company";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/hooks/use-toast";

export default function YourTeam() {
  const [activeTab, setActiveTab] = useState("about");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { company, loading, refetch } = useGetCompany();
  const employees: Employee[] = company?.employees ?? [];
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const { employee: selectedEmployeeData, loading: loadingEmployee } =
    useGetEmployeeById(selectedMemberId);

  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const { toast } = useToast();

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

  const handleImageChange = (newImageUrl: string | null) => {
    // Atualizar o estado local imediatamente para feedback visual rápido
    setSelectedMember((prev: any) => ({
      ...prev,
      design: {
        ...prev?.design,
        images: {
          ...prev?.design?.images,
          profile: {
            ...prev?.design?.images?.profile,
            url: newImageUrl,
          },
        },
      },
    }));

    // Recarregar dados da empresa para manter sincronização
    // Isso garante que a lista lateral também será atualizada
    setTimeout(() => {
      refetch();
    }, 500); // Pequeno delay para não interferir na UX
  };

  return (
    <div className="flex flex-col lg:flex-row h-[90vh] border rounded-lg shadow overflow-hidden bg-background">
      {/* Sidebar - Lista de Membros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/30 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Meu Time</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="h-8 gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {employees.length}{" "}
            {employees.length === 1 ? "funcionário" : "funcionários"} cadastrado
            {employees.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <TeamMemberList
            employees={employees}
            loading={loading}
            selectedMember={selectedMember}
            onSelectMember={member => handleSelectMember(member.id)}
          />
        </div>
      </aside>

      {/* Main Content - Detalhes do Membro */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedMember ? (
          <>
            {/* Header do Membro */}
            <div className="p-6 border-b bg-background">
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={selectedMember?.name}
                  surname={selectedMember?.surname}
                  imageUrl={selectedMember?.design?.images?.profile?.url}
                  size="lg"
                  editable={true}
                  employeeId={selectedMember?.id}
                  onImageChange={handleImageChange}
                  className="h-20 w-20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold truncate">
                        {selectedMember?.name} {selectedMember?.surname}
                      </h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>
                            {Array.isArray(selectedMember?.services)
                              ? selectedMember.services.length
                              : 0}{" "}
                            serviço
                            {selectedMember?.services?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {Array.isArray(selectedMember?.branches)
                              ? selectedMember.branches.length
                              : 0}{" "}
                            filial
                            {selectedMember?.branches?.length !== 1 ? "is" : ""}
                          </span>
                        </div>
                      </div>
                      {process.env.NODE_ENV === "development" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {selectedMember?.id}
                        </p>
                      )}
                    </div>
                    <TeamMemberActions
                      selectedMember={selectedMember}
                      onDelete={() => handleDeleteMember(selectedMember)}
                      onSave={updatedUser => handleSaveMember(updatedUser)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs de Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b px-6 bg-background sticky top-0 z-10">
                  <TabsList className="w-full justify-start h-12 bg-transparent">
                    <TabsTrigger value="about" className="gap-2">
                      <User className="w-4 h-4" />
                      Sobre
                    </TabsTrigger>
                    <TabsTrigger value="services" className="gap-2">
                      <Briefcase className="w-4 h-4" />
                      Serviços
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {Array.isArray(selectedMember?.services)
                          ? selectedMember.services.length
                          : 0}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="work-range-services" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Serviços por Horário
                    </TabsTrigger>
                    <TabsTrigger value="working-hours" className="gap-2">
                      <MapPin className="w-4 h-4" />
                      Filiais
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {Array.isArray(selectedMember?.branches)
                          ? selectedMember.branches.length
                          : 0}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="breaks" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Jornada de Trabalho
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  {/* Tab: Sobre */}
                  <TabsContent value="about" className="mt-0">
                    <AboutSection selectedMember={selectedMember} />
                  </TabsContent>

                  {/* Tab: Serviços */}
                  <TabsContent value="services" className="mt-0">
                    <ServicesSection
                      selectedMember={selectedMember}
                      setSelectedMember={setSelectedMember}
                    />
                  </TabsContent>

                  {/* Tab: Serviços por Horário */}
                  <TabsContent value="work-range-services" className="mt-0">
                    <WorkRangeServicesSection
                      selectedMember={selectedMember}
                      setSelectedMember={setSelectedMember}
                    />
                  </TabsContent>

                  {/* Tab: Filiais */}
                  <TabsContent value="working-hours" className="mt-0">
                    <Branch
                      selectedMember={selectedMember}
                      setSelectedMember={setSelectedMember}
                    />
                  </TabsContent>

                  {/* Tab: Jornada de Trabalho */}
                  <TabsContent value="breaks" className="mt-0">
                    <WorkScheduleManager
                      employeeId={selectedMember.id.toString()}
                      initialData={
                        Array.isArray(selectedMember.work_schedule)
                          ? selectedMember.work_schedule
                          : []
                      }
                      branches={
                        Array.isArray(selectedMember.branches)
                          ? selectedMember.branches
                          : []
                      }
                      services={
                        Array.isArray(selectedMember.services)
                          ? selectedMember.services
                          : []
                      }
                      onSuccess={() => {
                        toast({
                          title: "Horários atualizados",
                          description:
                            "A jornada de trabalho foi salva com sucesso.",
                        });
                        if (selectedMember?.id) {
                          setSelectedMemberId(selectedMember.id);
                        }
                      }}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full border-none shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Selecione um membro
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Escolha um funcionário na lista ao lado para visualizar e
                  gerenciar seus detalhes
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <AddTeamMemberDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
