"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GiBurningTree } from "react-icons/gi";
import * as zod from "zod";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BusinessNameField } from "../business-name-field";
import { IndustryField } from "../industry-field";
import { AboutField } from "../about-field";
import { Contact } from "../contact";
import { Location } from "../location";
import { BusinessSchema } from "../../../../../../schema";
const EditBusiness = () => {
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [businessData, setBusinessData] = useState(null);

  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      about: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    if (!id) return;

    const fetchBusiness = async () => {
      try {
        const response = await fetch(`http://localhost:3333/business/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do negócio.");

        const data = await response.json();
        setBusinessData(data);

        // Preencher o formulário com os dados da empresa
        setValue("businessName", data.businessName);
        setValue("industry", data.industry);
        setValue("about", data.about);
        // Outros campos podem ser configurados aqui
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchBusiness();
  }, [id, setValue]);

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    try {
      const response = await fetch(`http://localhost:3333/business/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar os dados");
      }

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar os dados.",
        variant: "destructive",
      });
    }
  };

  const industries = [
    "Automotive",
    "Barbershop",
    "Beauty",
    "Business services",
    "Cafe",
    "Charity",
    "Church",
    "Cleaning",
    "Clinic",
    "Computers",
  ];

  const filteredIndustries = industries.filter(industry =>
    industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!businessData) return <p>Carregando dados do negócio...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-bold">Editar Negócio</h2>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isSubmitting}
          className={`rounded-full ${
            !isDirty
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "opacity-100"
          }`}
        >
          {isSubmitting ? "Enviando..." : "Salvar"}
        </Button>
      </div>
      <Separator className="my-4" />

      {/* Divisão em duas colunas */}
      <div className="grid gap-6 md:grid-cols-1 max-w-3xl mx-auto">
        {/* Coluna do Formulário Principal */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardContent className="p-0 relative">
              <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                <div className="border-2 rounded-full border-gray-300 p-2 shadow-md">
                  <GiBurningTree className="size-6" />
                </div>
                <Button
                  variant="outline"
                  className="absolute bottom-2 right-2 rounded-md shadow-sm"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload banner image
                </Button>
              </div>
            </CardContent>
          </Card>

          <BusinessNameField
            register={register}
            error={errors.businessName?.message}
          />

          <IndustryField
            control={control}
            error={errors.industry?.message}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredIndustries={filteredIndustries}
          />

          <AboutField register={register} error={errors.about?.message} />
          <Separator className="my-10" />
          <Contact control={control} register={register} errors={errors} />
          <Separator className="my-10" />
          <Location control={control} register={register} errors={errors} />
        </form>
        <div>....</div>
        {/* Coluna Direita: Componente Contact */}
      </div>
    </div>
  );
};

export default EditBusiness;
