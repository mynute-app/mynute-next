"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GiBurningTree } from "react-icons/gi";
import * as zod from "zod";
import { BusinessSchema } from "../../../../../schema";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "./contact";
import { IndustryField } from "./industry-field";
import { BusinessNameField } from "./business-name-field";
import { AboutField } from "./about-field";
import { Location } from "./location";

export default function YourBrand() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
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
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    try {
      const checkResponse = await fetch(
        `http://localhost:3333/business?businessName=${values.businessName}`
      );
      const existingBusinesses = await checkResponse.json();

      if (existingBusinesses.length > 0) {
        toast({
          title: "Erro",
          description: "O nome da empresa já existe. Escolha outro nome.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("http://localhost:3333/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar os dados");
      }

      toast({
        title: "Sucesso",
        description: "Dados enviados com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = () => {
    handleSubmit(onSubmit)();
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-bold">Your brand</h2>

        <Button
          onClick={handleButtonClick}
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
}
