"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Branch } from "../../../../../types/company";

type BranchInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSaved?: (branch: Branch) => void;
};

type BranchEditFormValues = {
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
};

const buildDefaultValues = (branch: Branch | null): BranchEditFormValues => ({
  name: branch?.name ?? "",
  street: branch?.street ?? "",
  number: branch?.number ?? "",
  complement: branch?.complement ?? "",
  neighborhood: branch?.neighborhood ?? "",
  zip_code: branch?.zip_code ?? "",
  city: branch?.city ?? "",
  state: branch?.state ?? "",
  country: branch?.country ?? "",
});

export function BranchInfoDialog({
  open,
  onOpenChange,
  branch,
  onSaved,
}: BranchInfoDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues = useMemo(() => buildDefaultValues(branch), [branch]);
  const { register, handleSubmit, reset, formState } =
    useForm<BranchEditFormValues>({
      defaultValues,
    });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const handleSave = async (values: BranchEditFormValues) => {
    if (!branch) return;
    if (!formState.isDirty) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/branch/${branch.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao atualizar filial");
      }

      const updatedBranch = await response.json();
      reset(buildDefaultValues(updatedBranch));

      toast({
        title: "Filial atualizada!",
        description: "Os dados foram salvos com sucesso.",
      });

      onSaved?.(updatedBranch);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar alteracoes",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar as alteracoes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle>
            {branch ? "Editar filial" : "Carregando filial"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Atualize as informacoes da filial.
          </DialogDescription>
        </DialogHeader>

        {!branch ? (
          <div className="space-y-4 px-6 py-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(handleSave)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="flex-1 px-6">
              <div className="mt-4 space-y-4 pb-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Nome da filial *</Label>
                  <Input
                    id="branch-name"
                    placeholder="Ex: Unidade Centro"
                    {...register("name", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-street">Rua *</Label>
                  <Input
                    id="branch-street"
                    placeholder="Nome da rua"
                    {...register("street", { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch-number">Numero *</Label>
                    <Input
                      id="branch-number"
                      placeholder="Numero"
                      {...register("number", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-complement">Complemento</Label>
                    <Input
                      id="branch-complement"
                      placeholder="Apto, sala, etc."
                      {...register("complement")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch-neighborhood">Bairro</Label>
                    <Input
                      id="branch-neighborhood"
                      placeholder="Bairro"
                      {...register("neighborhood")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-zip">CEP *</Label>
                    <Input
                      id="branch-zip"
                      placeholder="00000-000"
                      {...register("zip_code", { required: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch-city">Cidade *</Label>
                    <Input
                      id="branch-city"
                      placeholder="Cidade"
                      {...register("city", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-state">Estado *</Label>
                    <Input
                      id="branch-state"
                      placeholder="Estado"
                      {...register("state", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-country">Pais *</Label>
                  <Input
                    id="branch-country"
                    placeholder="Pais"
                    {...register("country", { required: true })}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="btn-gradient"
                disabled={!branch || isSaving || !formState.isDirty}
              >
                {isSaving ? "Salvando..." : "Salvar alteracoes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
