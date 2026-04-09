"use client";

import { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  Building2,
  Globe,
  Hash,
  Home,
  Loader2,
  Map,
  MapPin,
  Navigation,
  Plus,
  Search,
} from "lucide-react";
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
  const [cepStatus, setCepStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cepError, setCepError] = useState<string | null>(null);
  const [lastCep, setLastCep] = useState<string | null>(null);

  const zipCodeValue = useWatch({ control: form.control, name: "zip_code" });
  const cepDigits = useMemo(
    () =>
      String(zipCodeValue || "")
        .replace(/\D/g, "")
        .slice(0, 8),
    [zipCodeValue],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset();
    setCepStatus("idle");
    setCepError(null);
    setLastCep(null);
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    const createdBranch = await handleSubmit(data);
    if (createdBranch) {
      onCreate(createdBranch);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (cepDigits.length !== 8) {
      setCepStatus("idle");
      setCepError(null);
      return;
    }

    if (lastCep === cepDigits) return;

    const controller = new AbortController();
    let isActive = true;

    const fetchAddressByCEP = async () => {
      setCepStatus("loading");
      setCepError(null);

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepDigits}/json/`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Falha ao obter dados do CEP");
        }

        const data = await response.json();

        if (!isActive || controller.signal.aborted) return;

        if (data?.erro) {
          setCepStatus("error");
          setCepError("CEP não encontrado.");
          return;
        }

        setValue("street", data.logradouro || "", { shouldDirty: true });
        setValue("city", data.localidade || "", { shouldDirty: true });
        setValue("neighborhood", data.bairro || "", { shouldDirty: true });
        setValue("state", data.uf || "", { shouldDirty: true });
        setValue("country", "Brasil", { shouldDirty: true });

        setLastCep(cepDigits);
        setCepStatus("success");
      } catch {
        if (!isActive || controller.signal.aborted) return;
        setCepStatus("error");
        setCepError("Não foi possível buscar o CEP.");
      }
    };

    void fetchAddressByCEP();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [cepDigits, isOpen, lastCep, setValue]);

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
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="branch-name"
                    placeholder="Nome da filial"
                    className="pl-9"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-zip">CEP *</Label>
                  <div className="relative">
                    {cepStatus === "loading" ? (
                      <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    ) : (
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                    <Input
                      id="branch-zip"
                      placeholder="00000000"
                      className="pl-9"
                      maxLength={8}
                      {...register("zip_code", {
                        onChange: event => {
                          const normalized = String(event.target.value || "")
                            .replace(/\D/g, "")
                            .slice(0, 8);

                          event.target.value = normalized;

                          if (normalized.length < 8) {
                            setLastCep(null);
                            setCepStatus("idle");
                            setCepError(null);
                          }
                        },
                      })}
                    />
                  </div>
                  {cepStatus === "loading" && (
                    <p className="text-xs text-muted-foreground">
                      Buscando endereço pelo CEP...
                    </p>
                  )}
                  {cepStatus === "success" && (
                    <p className="text-xs text-emerald-600">
                      Endereço preenchido automaticamente.
                    </p>
                  )}
                  {cepStatus === "error" && cepError && (
                    <p className="text-xs text-destructive">{cepError}</p>
                  )}
                  {errors.zip_code && (
                    <p className="text-xs text-destructive">
                      {String(errors.zip_code.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-street">Rua *</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-street"
                      placeholder="Nome da rua"
                      className="pl-9"
                      {...register("street")}
                    />
                  </div>
                  {errors.street && (
                    <p className="text-xs text-destructive">
                      {String(errors.street.message)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-number">Número *</Label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-number"
                      placeholder="Número"
                      className="pl-9"
                      {...register("number")}
                    />
                  </div>
                  {errors.number && (
                    <p className="text-xs text-destructive">
                      {String(errors.number.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-complement">Complemento</Label>
                  <div className="relative">
                    <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-complement"
                      placeholder="Apartamento, bloco, etc."
                      className="pl-9"
                      {...register("complement")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-neighborhood">Bairro</Label>
                  <div className="relative">
                    <Navigation className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-neighborhood"
                      placeholder="Bairro"
                      className="pl-9"
                      {...register("neighborhood")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-city">Cidade *</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-city"
                      placeholder="Cidade"
                      className="pl-9"
                      {...register("city")}
                    />
                  </div>
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
                  <div className="relative">
                    <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-state"
                      placeholder="Estado"
                      className="pl-9"
                      {...register("state")}
                    />
                  </div>
                  {errors.state && (
                    <p className="text-xs text-destructive">
                      {String(errors.state.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-country">País *</Label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="branch-country"
                      placeholder="País"
                      className="pl-9"
                      {...register("country")}
                    />
                  </div>
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
