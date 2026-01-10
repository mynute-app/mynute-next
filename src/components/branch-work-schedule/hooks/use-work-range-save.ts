import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWorkRangeServices } from "@/hooks/workSchedule/use-work-range-services";

interface SaveWorkRangeParams {
  formData: any;
  basicData: any;
  workRangeId: string;
  branchId: string;
  removedServices: string[];
  addedServices: string[];
  onSave: (data: any) => Promise<void>;
  onSuccessfulSave?: () => void;
  onClose: () => void;
}

export function useWorkRangeSave() {
  const { toast } = useToast();
  const {
    addServicesToWorkRange,
    removeServiceFromWorkRange,
    loading: servicesLoading,
  } = useWorkRangeServices();

  const saveWorkRange = useCallback(
    async ({
      basicData,
      workRangeId,
      branchId,
      removedServices,
      addedServices,
      onSave,
      onSuccessfulSave,
      onClose,
    }: SaveWorkRangeParams) => {
      try {
        await onSave(basicData);

        if (workRangeId && workRangeId !== "new") {
          // Remover serviços desvinculados
          if (removedServices.length > 0) {
            await Promise.all(
              removedServices.map(serviceId =>
                removeServiceFromWorkRange(branchId, workRangeId, serviceId, {
                  showToast: false,
                })
              )
            );
          }

          // Adicionar novos serviços vinculados
          if (addedServices.length > 0) {
            await addServicesToWorkRange(branchId, workRangeId, addedServices, {
              showToast: false,
            });
          }

          // Toast consolidado
          const changes: string[] = [];
          if (removedServices.length > 0) {
            changes.push(`${removedServices.length} serviço(s) removido(s)`);
          }
          if (addedServices.length > 0) {
            changes.push(`${addedServices.length} serviço(s) adicionado(s)`);
          }

          if (changes.length > 0) {
            toast({
              title: "Horário atualizado com sucesso",
              description: changes.join(" • "),
            });
          } else {
            toast({
              title: "Horário atualizado",
              description: "Alterações salvas com sucesso.",
            });
          }
        } else {
          toast({
            title: "Horário criado",
            description: "Horário de funcionamento configurado com sucesso.",
          });
        }

        onSuccessfulSave?.();
        onClose();
      } catch (error) {
        console.error("❌ Erro ao salvar work_range:", error);
      }
    },
    [addServicesToWorkRange, removeServiceFromWorkRange, toast]
  );

  return { saveWorkRange, servicesLoading };
}
