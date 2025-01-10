"use client";

import { useSession } from "next-auth/react"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { GiBurningTree } from "react-icons/gi";
import * as zod from "zod";
import { BusinessSchema } from "../../../../../schema";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import BrandLogoUpload from "./brand-logo";
import { BusinessNameField } from "./business-name-field";

export default function YourBrand() {
  const { data: session } = useSession(); 
  const { toast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null); 
  const [isEditing, setIsEditing] = useState(false); 

  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      businessName: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    if (!session?.user?.email) return; 

    const fetchBusinessData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3333/business?email=${session.user.email}`
        );
        const data = await response.json();

        if (data.length === 0) {
          setIsEditing(false);
          return;
        }

        const business = data[0];
        setBusinessId(business.id);
        setValue("businessName", business.businessName);
        setIsEditing(true);
      } catch (error) {
        console.error("Erro ao carregar dados da empresa:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da empresa.",
          variant: "destructive",
        });
      }
    };

    fetchBusinessData();
  }, [setValue, toast, session]);

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    if (!session?.user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:3333/business/${businessId}` 
        : "http://localhost:3333/business"; 
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, email: session.user.email }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar os dados.");
      }

      toast({
        title: "Sucesso",
        description: isEditing
          ? "Dados atualizados com sucesso!"
          : "Empresa cadastrada com sucesso!",
      });

      if (!isEditing) {
        const newBusiness = await response.json();
        setBusinessId(newBusiness.id); 
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-h-screen h-screen overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Brand</h2>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={session?.user?.email || "Carregando..."}
            readOnly
            className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 border-none focus:ring-0 pointer-events-none"
          />
        </div>

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

        <BrandLogoUpload />

        <BusinessNameField
          register={register}
          error={errors.businessName?.message}
        />
      </form>
    </div>
  );
}
