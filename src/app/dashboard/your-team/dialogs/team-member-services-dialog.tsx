"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Service } from "../../../../../types/company";

type TeamMemberServicesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Employee | null;
  setMember: React.Dispatch<React.SetStateAction<Employee | null>>;
  onReloadMember?: () => void;
  services?: Service[];
  loadingServices?: boolean;
};

export function TeamMemberServicesDialog({
  open,
  onOpenChange,
  member,
  setMember,
  onReloadMember,
  services = [],
  loadingServices = false,
}: TeamMemberServicesDialogProps) {
  const { toast } = useToast();
  const availableServices = services.filter(
    service => service && typeof service.name === "string"
  );

  const linkedServiceIds = new Set(
    member?.services?.map(service => service.id) ?? []
  );

  const handleLinkService = async (service: Service) => {
    if (!member) return;

    try {
      const res = await fetch(
        `/api/employee/${member.id}/service/${service.id}`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Erro ao vincular o servico");

      setMember(prev => {
        if (!prev) return prev;
        const nextServices = Array.isArray(prev.services)
          ? [...prev.services, service]
          : [service];
        return { ...prev, services: nextServices };
      });

      toast({
        title: "Servico vinculado",
        description: `O servico foi vinculado ao profissional ${member.name}.`,
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro ao vincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUnlinkService = async (service: Service) => {
    if (!member) return;

    try {
      const res = await fetch(
        `/api/employee/${member.id}/service/${service.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Erro ao desvincular o servico");

      setMember(prev => {
        if (!prev) return prev;
        const nextServices = Array.isArray(prev.services)
          ? prev.services.filter(item => item.id !== service.id)
          : [];
        return { ...prev, services: nextServices };
      });

      toast({
        title: "Servico desvinculado",
        description: `O servico foi removido do profissional ${member.name}.`,
        variant: "destructive",
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro ao desvincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleToggleService = async (service: Service) => {
    if (!service?.id) return;
    if (linkedServiceIds.has(service.id)) {
      await handleUnlinkService(service);
      return;
    }
    await handleLinkService(service);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] min-h-0 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {member ? "Servicos do profissional" : "Carregando profissional..."}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Selecione os servicos que este profissional realiza."
              : "Aguarde enquanto carregamos as informacoes do profissional."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6">
          {!member ? (
            <div className="py-6 text-sm text-muted-foreground">
              Buscando dados do profissional...
            </div>
          ) : (
            <div className="mt-4 pb-6 space-y-6">
              <div className="space-y-3">
                <Label>Servicos que o profissional atende</Label>
                <p className="text-sm text-muted-foreground">
                  Selecione os servicos que este profissional realiza.
                </p>
                {loadingServices ? (
                  <span className="text-sm text-muted-foreground">
                    Carregando servicos...
                  </span>
                ) : availableServices.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Nenhum servico cadastrado
                  </span>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableServices.map(service => {
                      const isLinked = linkedServiceIds.has(service.id);
                      const price =
                        service.price && Number(service.price) > 0
                          ? `R$ ${Number(service.price).toFixed(2)}`
                          : "Gratuito";
                      const durationLabel = service.duration
                        ? `${service.duration} min`
                        : "--";

                      return (
                        <div
                          key={service.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isLinked}
                          onClick={() => handleToggleService(service)}
                          onKeyDown={event => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleToggleService(service);
                            }
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                            isLinked
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Checkbox
                            checked={isLinked}
                            className="pointer-events-none"
                            tabIndex={-1}
                            aria-hidden="true"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isLinked && (
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                              )}
                              <span
                                className={`text-sm font-medium truncate ${
                                  isLinked ? "text-primary" : ""
                                }`}
                              >
                                {service.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{durationLabel}</span>
                              <span>{price}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {!loadingServices &&
                  availableServices.length > 0 &&
                  linkedServiceIds.size === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selecione pelo menos um servico
                    </p>
                  )}
              </div>
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
