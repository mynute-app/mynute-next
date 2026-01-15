"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save } from "lucide-react";
import { Company } from "../../../../../types/company";
import { useToast } from "@/hooks/use-toast";

interface BusinessInfoSectionProps {
  company: Company;
}

export default function BusinessInfoSection({
  company,
}: BusinessInfoSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: company.name || "",
      legalName: company.legal_name || "",
      taxId: company.tax_id || "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      console.log("Salvando informacoes:", data);

      toast({
        title: "Informacoes bloqueadas",
        description: "Estes campos estao bloqueados para edicao no momento.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as informacoes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Informacoes do Negocio
          </h2>
          <p className="text-sm text-muted-foreground">
            Dados principais da sua empresa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome Fantasia</Label>
            <Input
              id="businessName"
              placeholder="Nome da empresa"
              {...register("businessName")}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Este campo nao pode ser alterado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">Razao Social</Label>
            <Input
              id="legalName"
              placeholder="Razao social da empresa"
              {...register("legalName")}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Este campo nao pode ser alterado.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">CNPJ/CPF</Label>
          <Input
            id="taxId"
            placeholder="CNPJ da empresa"
            {...register("taxId")}
            readOnly
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            Este campo nao pode ser alterado.
          </p>
        </div>
      </div>

      {/* <div className="flex justify-end">
        <Button
          type="submit"
          disabled={true}
          className="gap-2 opacity-50 cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Campos Bloqueados
        </Button>
      </div> */}
    </form>
  );
}
