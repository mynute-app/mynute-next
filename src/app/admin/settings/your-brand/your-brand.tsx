"use client";

import { useForm } from "react-hook-form";
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

export default function YourBrand() {
  const { toast } = useToast();
  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      businessName: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    try {
      // Realiza o GET para verificar se o nome da empresa já existe
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

      // Caso o nome não exista, continua com o POST
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-bold ">Your brand</h2>

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
      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-yellow-300"
        >
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

          <div className="space-y-2">
            <Label htmlFor="businessName">Nome</Label>
            <Input
              id="businessName"
              placeholder="Nome da empresa"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-sm text-red-500">
                {errors.businessName.message}
              </p>
            )}
          </div>
        </form>

        <div className="bg-fuchsia-500">...</div>
      </div>
    </div>
  );
}
