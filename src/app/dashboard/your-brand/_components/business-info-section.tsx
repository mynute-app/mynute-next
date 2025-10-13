"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      // TODO: Implementar chamada da API para atualizar informações
      console.log("Salvando informações:", data);

      toast({
        title: "Informações atualizadas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>Dados principais da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome Fantasia</Label>
            <Input
              id="businessName"
              placeholder="Nome da empresa"
              {...register("businessName", {
                required: "O nome da empresa é obrigatório.",
              })}
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">Razão Social</Label>
            <Input
              id="legalName"
              placeholder="Razão social da empresa"
              {...register("legalName")}
            />
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
              Este campo não pode ser alterado.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
