"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import type { Branch } from "../../../../../types/company";
import { useAddAddressForm } from "../actions/useAddAddressForm";

type AddBranchDialogProps = {
  onCreate: (branch: Branch) => void;
  trigger?: React.ReactNode;
};

export const AddAddressDialog = ({
  onCreate,
  trigger,
}: AddBranchDialogProps) => {
  const { form, handleSubmit } = useAddAddressForm();
  const {
    register,
    handleSubmit: submitHandler,
    setValue,
    formState,
    reset,
  } = form;
  const { errors, isSubmitting } = formState;

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    const createdBranch = await handleSubmit(data);
    if (createdBranch) {
      onCreate(createdBranch);
      setIsOpen(false);
    }
  };

  const fetchAddressByCEP = async (cep: string) => {
    if (cep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue("street", data.logradouro);
        setValue("city", data.localidade);
        setValue("neighborhood", data.bairro);
        setValue("state", data.uf);
        setValue("country", "Brasil");
      }
    } catch (error) {
      console.error("Erro ao buscar endereco pelo CEP:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" type="button">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle>Nova filial</DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os detalhes abaixo para cadastrar uma nova filial.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submitHandler(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <ScrollArea className="flex-1 px-6">
            <div className="mt-4 space-y-4 pb-4 px-2">
              <div className="space-y-2">
                <Label htmlFor="branch-name">Nome da filial *</Label>
                <Input
                  id="branch-name"
                  placeholder="Nome da filial"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-zip">CEP *</Label>
                  <Input
                    id="branch-zip"
                    placeholder="00000-000"
                    {...register("zip_code")}
                    maxLength={8}
                    onBlur={event => fetchAddressByCEP(event.target.value)}
                  />
                  {errors.zip_code && (
                    <p className="text-xs text-destructive">
                      {String(errors.zip_code.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-street">Rua *</Label>
                  <Input
                    id="branch-street"
                    placeholder="Nome da rua"
                    {...register("street")}
                  />
                  {errors.street && (
                    <p className="text-xs text-destructive">
                      {String(errors.street.message)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-number">Numero *</Label>
                  <Input
                    id="branch-number"
                    placeholder="Numero"
                    {...register("number")}
                  />
                  {errors.number && (
                    <p className="text-xs text-destructive">
                      {String(errors.number.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-complement">Complemento</Label>
                  <Input
                    id="branch-complement"
                    placeholder="Apartamento, bloco, etc."
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
                  <Label htmlFor="branch-city">Cidade *</Label>
                  <Input
                    id="branch-city"
                    placeholder="Cidade"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {String(errors.city.message)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-state">Estado *</Label>
                  <Input
                    id="branch-state"
                    placeholder="Estado"
                    {...register("state")}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {String(errors.state.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-country">Pais *</Label>
                  <Input
                    id="branch-country"
                    placeholder="Pais"
                    {...register("country")}
                  />
                  {errors.country && (
                    <p className="text-xs text-destructive">
                      {String(errors.country.message)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Criar filial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
