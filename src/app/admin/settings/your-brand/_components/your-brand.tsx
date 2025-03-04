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
import { BusinessSchema } from "../../../../../../schema";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import BrandLogoUpload from "../brand-logo";
import { useGetCompany } from "@/hooks/get-one-company";
import { BusinessInfoFields } from "./business-Info-fields";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressField } from "./address-field";

export default function YourBrand() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const companyId = 1;
  const { company, loading } = useGetCompany(companyId);
  console.log(company);
  const form = useForm<zod.infer<typeof BusinessSchema>>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const onSubmit = async (values: zod.infer<typeof BusinessSchema>) => {
    console.log("dados", values);
  };

  return (
    <div className="container mx-auto p-4 max-h-screen h-screen overflow-y-auto ">
      <div className="flex justify-between items-center">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-xl font-bold flex justify-start items-start flex-col">
              Sua Marca
              <div className="text-sm font-thin text-gray-500">
                ({company?.name})
              </div>
            </div>
          </>
        )}

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
        {/* Email do usuário */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={session?.user?.email || "Carregando..."}
            readOnly
            className="bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 border-none focus:ring-0"
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

        <BusinessInfoFields
          register={register}
          error={errors.name?.message}
          name={company?.name || ""}
          taxId={company?.tax_id || ""}
          loading={loading}
        />
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Filiais</h2>
          {loading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            company?.branches?.map((branch: any, index: any) => (
              <AddressField
                key={branch.id}
                register={register}
                branch={branch}
                error={errors.name?.message}
                index={index}
              />
            ))
          )}
        </div>
      </form>
    </div>
  );
}
