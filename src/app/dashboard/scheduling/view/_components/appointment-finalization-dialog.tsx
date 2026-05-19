"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PackageCheck } from "lucide-react";
import { useAppointmentInventoryUsages } from "@/hooks/appointment/use-appointment-inventory-usages";
import { useFinalizeAppointment } from "@/hooks/appointment/use-finalize-appointment";
import type {
  FinalizeAppointmentResponse,
  FinalizeUsageItem,
} from "../../../../../../types/inventory";

interface AppointmentFinalizationDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinalized: (response: FinalizeAppointmentResponse) => void;
}

interface UsageFormState {
  actual_quantity: string;
  batch_id: string;
  serial_id: string;
  notes: string;
}

const formatCentsToBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export function AppointmentFinalizationDialog({
  appointmentId,
  open,
  onOpenChange,
  onFinalized,
}: AppointmentFinalizationDialogProps) {
  const { toast } = useToast();
  const { usages, loading: loadingUsages, fetchUsages } =
    useAppointmentInventoryUsages(appointmentId);
  const { finalizeAppointment, loading: finalizing } = useFinalizeAppointment();

  const [form, setForm] = useState<Record<string, UsageFormState>>({});
  const [shortagePolicy, setShortagePolicy] = useState<string>("__none__");

  useEffect(() => {
    if (open && appointmentId) {
      fetchUsages();
    }
  }, [open, appointmentId, fetchUsages]);

  useEffect(() => {
    const initial: Record<string, UsageFormState> = {};
    for (const u of usages) {
      initial[u.id] = {
        actual_quantity: String(u.planned_quantity),
        batch_id: u.batch_id ?? "",
        serial_id: u.serial_id ?? "",
        notes: u.notes ?? "",
      };
    }
    setForm(initial);
  }, [usages]);

  const activeUsages = usages.filter(
    u => u.status !== "skipped" && u.status !== "cancelled",
  );

  const updateField = (
    usageId: string,
    field: keyof UsageFormState,
    value: string,
  ) =>
    setForm(prev => ({
      ...prev,
      [usageId]: { ...prev[usageId], [field]: value },
    }));

  const handleSubmit = async () => {
    const usageItems: FinalizeUsageItem[] = activeUsages.map(u => {
      const f = form[u.id] ?? {
        actual_quantity: String(u.planned_quantity),
        batch_id: "",
        serial_id: "",
        notes: "",
      };
      const item: FinalizeUsageItem = {
        usage_id: u.id,
        actual_quantity: Math.max(0, Number(f.actual_quantity) || 0),
      };
      if (f.batch_id) item.batch_id = f.batch_id;
      if (f.serial_id) item.serial_id = f.serial_id;
      if (f.notes) item.notes = f.notes;
      return item;
    });

    try {
      const response = await finalizeAppointment(appointmentId, {
        items: usageItems,
        ...(shortagePolicy !== "__none__"
          ? {
              shortage_policy_override: shortagePolicy as
                | "block_finish"
                | "create_pending"
                | "allow_negative",
            }
          : {}),
      });
      toast({
        title: "Agendamento finalizado",
        description: "O estoque foi atualizado com sucesso.",
      });
      onOpenChange(false);
      onFinalized(response);
    } catch (error) {
      toast({
        title: "Erro ao finalizar",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[650px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            Finalizar Agendamento
          </DialogTitle>
          <DialogDescription>
            Confirme as quantidades reais de produtos utilizados no atendimento.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-220px)]">
          <div className="space-y-4 pr-4">
            {loadingUsages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeUsages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum produto de estoque planejado para este atendimento.
              </p>
            ) : (
              activeUsages.map(usage => (
                <div
                  key={usage.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {usage.product_name ?? "Produto"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Planejado: {usage.planned_quantity}{" "}
                      {usage.unit_symbol ?? ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`qty-${usage.id}`}
                        className="text-xs"
                      >
                        Quantidade real *
                      </Label>
                      <Input
                        id={`qty-${usage.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form[usage.id]?.actual_quantity ??
                          usage.planned_quantity
                        }
                        onChange={e =>
                          updateField(
                            usage.id,
                            "actual_quantity",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Custo unitário
                      </Label>
                      <p className="h-10 flex items-center text-sm">
                        {formatCentsToBRL(usage.unit_cost)}
                      </p>
                    </div>
                  </div>

                  {usage.batch_id != null && (
                    <div className="space-y-1">
                      <Label
                        htmlFor={`batch-${usage.id}`}
                        className="text-xs"
                      >
                        Lote (batch_id)
                      </Label>
                      <Input
                        id={`batch-${usage.id}`}
                        value={form[usage.id]?.batch_id ?? ""}
                        onChange={e =>
                          updateField(usage.id, "batch_id", e.target.value)
                        }
                        placeholder="ID do lote"
                      />
                    </div>
                  )}

                  {usage.serial_id != null && (
                    <div className="space-y-1">
                      <Label
                        htmlFor={`serial-${usage.id}`}
                        className="text-xs"
                      >
                        Número de série (serial_id)
                      </Label>
                      <Input
                        id={`serial-${usage.id}`}
                        value={form[usage.id]?.serial_id ?? ""}
                        onChange={e =>
                          updateField(usage.id, "serial_id", e.target.value)
                        }
                        placeholder="Número de série"
                      />
                    </div>
                  )}
                </div>
              ))
            )}

            {activeUsages.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Política de escassez (opcional)
                  </Label>
                  <Select
                    value={shortagePolicy}
                    onValueChange={setShortagePolicy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Padrão do sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        Padrão do sistema
                      </SelectItem>
                      <SelectItem value="block_finish">
                        Bloquear finalização
                      </SelectItem>
                      <SelectItem value="create_pending">
                        Criar registro pendente
                      </SelectItem>
                      <SelectItem value="allow_negative">
                        Permitir estoque negativo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={finalizing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={finalizing || loadingUsages}
            className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white"
          >
            {finalizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <PackageCheck className="h-4 w-4 mr-2" />
                Finalizar Atendimento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
