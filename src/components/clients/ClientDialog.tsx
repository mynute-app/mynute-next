"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  client?: CompanyClient;
  onCreated: (client: CompanyClient) => void;
  onUpdated: (client: CompanyClient) => void;
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

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onCreated,
  onUpdated,
}: ClientDialogProps) {
  const isEditing = Boolean(client);
  const form = useForm<CompanyClientFormData>({
    resolver: zodResolver(companyClientFormSchema),
    defaultValues,
  });

  const { createCompanyClient, loading, error, reset } =
    useCreateCompanyClient();

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    if (client) {
      form.reset({
        name: client.name || "",
        surname: client.surname || "",
        email: client.email || "",
        phone: client.phone || "",
        street: client.street || "",
        number: client.number || "",
        neighborhood: client.neighborhood || "",
        city: client.city || "",
        state: client.state || "",
        country: client.country || "Brasil",
        zip_code: client.zip_code || "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [client, open, form, reset]);

  const handleSubmit = async (values: CompanyClientFormData) => {
    if (isEditing && client) {
      onUpdated({
        ...client,
        ...values,
      });
      onOpenChange(false);
      return;
    }

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
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cliente"
              : "Preencha os dados para cadastrar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Dados Principais
                  </h3>
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
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="País" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zip_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-destructive">
                    {error}
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
                {isEditing ? "Salvar Alterações" : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
