"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Employee, Service } from "../../../../../types/company";
import { WorkRangeServicesSection } from "../work-range-services-section";

type TeamMemberServicesScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Employee | null;
  setMember: React.Dispatch<React.SetStateAction<Employee | null>>;
  onReloadMember?: () => void;
  services?: Service[];
  loadingServices?: boolean;
};

export function TeamMemberServicesScheduleDialog({
  open,
  onOpenChange,
  member,
  setMember,
  onReloadMember,
  services,
  loadingServices,
}: TeamMemberServicesScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] min-h-0 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {member ? "Servicos por horario" : "Carregando profissional..."}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Configure os servicos disponiveis em cada horario."
              : "Aguarde enquanto carregamos as informacoes do profissional."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6">
          {!member ? (
            <div className="py-6 text-sm text-muted-foreground">
              Buscando dados do profissional...
            </div>
          ) : (
            <div className="mt-4 pb-6">
              <WorkRangeServicesSection
                selectedMember={member}
                setSelectedMember={setMember}
                onReloadMember={onReloadMember}
                services={services}
                loadingServices={loadingServices}
              />
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
