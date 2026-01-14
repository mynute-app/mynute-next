"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AboutSection } from "../about-section";
import { ServicesSection } from "../services-section";
import { WorkRangeServicesSection } from "../work-range-services-section";
import { Branch } from "../branch-section";
import { WorkScheduleManager } from "@/components/work-schedule";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "../../../../../types/company";

type EditUserDialogProps = {
  user: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onReloadMember?: (id: number) => void;
};

function EditUserDialog({
  user,
  isOpen,
  onClose,
  onReloadMember,
}: EditUserDialogProps) {
  const [activeTab, setActiveTab] = useState("about");
  const [currentMember, setCurrentMember] = useState<Employee | null>(user);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentMember(user);
    setActiveTab("about");
  }, [user, isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!currentMember) {
    return (
      <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
        <DialogContent className="team-dialog max-w-3xl">
          <DialogHeader>
            <DialogTitle>Carregando profissional...</DialogTitle>
            <DialogDescription>
              Aguarde enquanto carregamos as informa\u00e7\u00f5es.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="team-dialog max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Profissional</DialogTitle>
          <DialogDescription>
            Gerencie as informa\u00e7\u00f5es e permiss\u00f5es do profissional.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start h-12 bg-transparent">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="services">Servi\u00e7os</TabsTrigger>
            <TabsTrigger value="work-range-services">
              Servi\u00e7os por Hor\u00e1rio
            </TabsTrigger>
            <TabsTrigger value="branches">Filiais</TabsTrigger>
            <TabsTrigger value="breaks">Jornada de Trabalho</TabsTrigger>
          </TabsList>

          <div className="pt-4">
            <TabsContent value="about" className="mt-0">
              <AboutSection selectedMember={currentMember} />
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              <ServicesSection
                selectedMember={currentMember}
                setSelectedMember={setCurrentMember}
              />
            </TabsContent>

            <TabsContent value="work-range-services" className="mt-0">
              <WorkRangeServicesSection
                selectedMember={currentMember}
                setSelectedMember={setCurrentMember}
              />
            </TabsContent>

            <TabsContent value="branches" className="mt-0">
              <Branch
                selectedMember={currentMember}
                setSelectedMember={setCurrentMember}
              />
            </TabsContent>

            <TabsContent value="breaks" className="mt-0">
              <WorkScheduleManager
                employeeId={currentMember.id.toString()}
                initialData={
                  Array.isArray(currentMember.work_schedule)
                    ? currentMember.work_schedule
                    : []
                }
                branches={
                  Array.isArray(currentMember.branches)
                    ? currentMember.branches.map(branch => ({
                        id: branch.id.toString(),
                        name: branch.name,
                      }))
                    : []
                }
                services={
                  Array.isArray(currentMember.services)
                    ? currentMember.services.map(service => ({
                        id: service.id.toString(),
                        name: service.name,
                      }))
                    : []
                }
                onSuccess={() => {
                  toast({
                    title: "Hor\u00e1rios atualizados",
                    description:
                      "A jornada de trabalho foi salva com sucesso.",
                  });
                  onReloadMember?.(currentMember.id);
                }}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;
