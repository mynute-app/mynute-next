"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Save, X } from "lucide-react";
import { useGetBranch } from "@/hooks/branch/use-get-branch";
import { useWorkRangeForm } from "./hooks/use-work-range-form";
import { useWorkRangeSave } from "./hooks/use-work-range-save";
import { WorkRangeFormFields } from "./components/work-range-form-fields";

interface WorkRangeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: WorkRangeEditData;
  loading?: boolean;
  disableWeekdayEdit?: boolean;
  branchId: string;
  workRangeId: string;
  onSuccessfulSave?: () => void;
  branchData?: any;
}

interface WorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
  services: string[];
}

export function WorkRangeEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
  disableWeekdayEdit = true,
  branchId,
  workRangeId,
  onSuccessfulSave,
  branchData: externalBranchData,
}: WorkRangeEditDialogProps) {
  const { data: branchData } = useGetBranch({
    branchId,
    enabled: !externalBranchData,
  });

  const overlayOpenCountRef = useRef(0);
  const { formData, initialServices, updateField, getChangedServices } =
    useWorkRangeForm(initialData);
  const { saveWorkRange, servicesLoading } = useWorkRangeSave();

  const handleOverlayOpenChange = useCallback((open: boolean) => {
    overlayOpenCountRef.current += open ? 1 : -1;
    if (overlayOpenCountRef.current < 0) overlayOpenCountRef.current = 0;
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && overlayOpenCountRef.current === 0) onClose();
    },
    [onClose]
  );

  const handleSave = useCallback(async () => {
    const basicData = {
      start_time: formData.start_time,
      end_time: formData.end_time,
      weekday: formData.weekday,
      time_zone: formData.time_zone,
    };

    const { removedServices, addedServices } = getChangedServices();

    await saveWorkRange({
      formData,
      basicData,
      workRangeId,
      branchId,
      removedServices,
      addedServices,
      onSave,
      onSuccessfulSave,
      onClose,
    });
  }, [
    formData,
    getChangedServices,
    saveWorkRange,
    workRangeId,
    branchId,
    onSave,
    onSuccessfulSave,
    onClose,
  ]);

  const isNewWorkRange = workRangeId === "new";
  const dialogTitle = isNewWorkRange ? "Configurar Horário" : "Editar Horário";
  const dialogDescription = isNewWorkRange
    ? "Configure o horário de funcionamento para este dia."
    : "Modifique os detalhes do horário de funcionamento.";

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange} modal={true}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={e => e.preventDefault()}
        onPointerDownOutside={e => e.preventDefault()}
        onFocusOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <WorkRangeFormFields
          formData={formData}
          disableWeekdayEdit={disableWeekdayEdit}
          updateField={updateField}
          handleOverlayOpenChange={handleOverlayOpenChange}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || servicesLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || servicesLoading}>
            <Save className="w-4 h-4 mr-2" />
            {loading || servicesLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
