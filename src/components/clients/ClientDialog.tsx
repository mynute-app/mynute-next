"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateCompanyClient } from "@/hooks/use-create-company-client";
import type { CompanyClient } from "@/types/company-client";
import {
  companyClientFormSchema,
  type CompanyClientFormData,
} from "./company-client-form-schema";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (client: CompanyClient) => void;
}

const defaultValues: CompanyClientFormData = {
  name: "",
  surname: "",
  email: "",
  phone: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
  zip_code: "",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatPhone = (value: string) => {
  const digits = onlyDigits(value);
  const normalized =
    digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
  const sliced = normalized.slice(0, 11);

  if (sliced.length <= 2) return sliced;
  if (sliced.length <= 6) return `(${sliced.slice(0, 2)}) ${sliced.slice(2)}`;
  if (sliced.length <= 10) {
    return `(${sliced.slice(0, 2)}) ${sliced.slice(2, 6)}-${sliced.slice(6)}`;
  }
  return `(${sliced.slice(0, 2)}) ${sliced.slice(2, 7)}-${sliced.slice(7)}`;
};

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export function ClientDialog({
  open,
  onOpenChange,
  onCreated,
}: ClientDialogProps) {
  const form = useForm<CompanyClientFormData>({
    resolver: zodResolver(companyClientFormSchema),
    defaultValues,
  });

  const { createCompanyClient, loading, error, errorCode, reset } =
    useCreateCompanyClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [cepStatus, setCepStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cepError, setCepError] = useState<string | null>(null);
  const [lastCep, setLastCep] = useState<string | null>(null);

  const zipCodeValue = useWatch({ control: form.control, name: "zip_code" });
  const cepDigits = useMemo(() => onlyDigits(zipCodeValue || ""), [zipCodeValue]);
  const shouldShowAddress = cepDigits.length >= 8;

  useEffect(() => {
    if (!open) {
      reset();
      setFormError(null);
      setCepStatus("idle");
      setCepError(null);
      setLastCep(null);
      return;
    }

    form.reset(defaultValues);
    setLastCep(null);
  }, [open, form, reset]);

  useEffect(() => {
    form.clearErrors(["phone", "email"]);

    if (!error) {
      setFormError(null);
      return;
    }

    if (errorCode === "PHONE_DUPLICATE") {
      form.setError("phone", {
        type: "manual",
        message: "Telefone já cadastrado.",
      });
      setFormError(null);
      return;
    }

    if (errorCode === "EMAIL_DUPLICATE") {
      form.setError("email", {
        type: "manual",
        message: "E-mail já cadastrado.",
      });
      setFormError(null);
      return;
    }

    setFormError(error);
  }, [error, errorCode, form]);

  useEffect(() => {
    if (!open) return;
    if (cepDigits.length !== 8) {
      setCepStatus("idle");
      setCepError(null);
      return;
    }
    if (lastCep === cepDigits) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const fetchCep = async () => {
      setCepStatus("loading");
      setCepError(null);

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepDigits}/json/`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!isActive || controller.signal.aborted) return;

        if (data?.erro) {
          setCepStatus("error");
          setCepError("CEP não encontrado.");
          return;
        }

        form.setValue("street", data.logradouro || "", {
          shouldDirty: true,
        });
        form.setValue("neighborhood", data.bairro || "", {
          shouldDirty: true,
        });
        form.setValue("city", data.localidade || "", {
          shouldDirty: true,
        });
        form.setValue("state", data.uf || "", {
          shouldDirty: true,
        });
        form.setValue("country", "Brasil", { shouldDirty: true });

        setLastCep(cepDigits);
        setCepStatus("success");
      } catch (fetchError) {
        if (!isActive || controller.signal.aborted) return;
        setCepStatus("error");
        setCepError("Não foi possível buscar o CEP.");
      }
    };

    fetchCep();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [cepDigits, form, lastCep, open]);

  const handleSubmit = async (values: CompanyClientFormData) => {
    setFormError(null);
    const created = await createCompanyClient(values);
    if (created) {
      onCreated(created);
      onOpenChange(false);
      form.reset(defaultValues);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] min-h-0 max-w-2xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-6 py-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Dados principais
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Informações básicas de contato do cliente.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Sobrenome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="cliente@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(11) 99999-9999"
                              value={field.value || ""}
                              onChange={event =>
                                field.onChange(formatPhone(event.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Endereço
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Informe o CEP para preencher automaticamente.
                      </p>
                    </div>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              value={field.value || ""}
                              onChange={event =>
                                field.onChange(formatCep(event.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-2 text-xs text-muted-foreground md:col-span-1">
                      {cepStatus === "loading" && (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Buscando CEP...
                        </>
                      )}
                      {cepStatus === "success" && (
                        <span>Endereço preenchido automaticamente.</span>
                      )}
                      {cepStatus === "error" && (
                        <span className="text-destructive">{cepError}</span>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {shouldShowAddress && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 overflow-hidden"
                      >
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Rua</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="Número" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="neighborhood"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input placeholder="Bairro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Cidade" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input placeholder="Estado" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>País</FormLabel>
                              <FormControl>
                                <Input placeholder="País" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {formError && (
                  <p className="text-sm font-medium text-destructive">
                    {formError}
                  </p>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-gradient" disabled={loading}>
                Criar Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
