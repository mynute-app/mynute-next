"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  companyRegisterSchema,
  CompanyRegisterSchema,
} from "../../../../schema/company-register";
import { toast } from "@/hooks/use-toast";
import { useCreateCompany } from "@/hooks/create-company";
import { useRouter } from "next/navigation";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyRegisterSchema>({
    resolver: zodResolver(companyRegisterSchema),
  });
  const router = useRouter();
  const { submit } = useCreateCompany(); // chama o hook

  const onSubmit = async (data: CompanyRegisterSchema) => {
    try {
      await submit(data);

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Você será redirecionado para o login.",
      });

      reset();

      router.push("/auth/admin");
    } catch (err) {
      toast({
        title: "Erro ao cadastrar empresa",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Crie sua empresa</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Preencha os dados abaixo para cadastrar sua empresa
        </p>
      </div>

      <div className="grid gap-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome da Empresa</Label>
          <Input id="name" {...register("name")} placeholder="Waffle Tech" />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tax_id">CNPJ</Label>
          <Input
            id="tax_id"
            {...register("tax_id")}
            placeholder="00000000000000"
          />
          {errors.tax_id && (
            <p className="text-xs text-red-500">{errors.tax_id.message}</p>
          )}
        </div>

        <div className="flex gap-2 ">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="owner_name">Nome</Label>
            <Input
              id="owner_name"
              {...register("owner_name")}
              placeholder="John"
            />
            {errors.owner_name && (
              <p className="text-xs text-red-500">
                {errors.owner_name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2 flex-1">
            <Label htmlFor="owner_surname">Sobrenome</Label>
            <Input
              id="owner_surname"
              {...register("owner_surname")}
              placeholder="Clark"
            />
            {errors.owner_surname && (
              <p className="text-xs text-red-500">
                {errors.owner_surname.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="owner_email">Email</Label>
          <Input
            id="owner_email"
            type="email"
            {...register("owner_email")}
            placeholder="john.clark@gmail.com"
          />
          {errors.owner_email && (
            <p className="text-xs text-red-500">{errors.owner_email.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="owner_phone">Telefone</Label>
          <Input
            id="owner_phone"
            {...register("owner_phone")}
            placeholder="+15555555555"
          />
          {errors.owner_phone && (
            <p className="text-xs text-red-500">{errors.owner_phone.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="owner_password">Senha</Label>
          <Input
            id="owner_password"
            type="password"
            {...register("owner_password")}
          />
          {errors.owner_password && (
            <p className="text-xs text-red-500">
              {errors.owner_password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Já tem uma conta?{" "}
        <Link href="/auth/admin" className="underline underline-offset-4">
          Faça login
        </Link>
      </div>
    </form>
  );
}
