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
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { FormError } from "./form/form-error";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { submit } = useCreateCompany();

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
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Crie sua empresa</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Preencha os dados abaixo para cadastrar sua empresa
        </p>
      </div>

      <div className="grid gap-0.5">
        <div className="grid gap-1">
          <Label htmlFor="name">Nome da Empresa</Label>
          <Input id="name" {...register("name")} placeholder="Waffle Tech" />
          <FormError message={errors.name?.message} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="tax_id">CNPJ</Label>
          <Input
            id="tax_id"
            {...register("tax_id")}
            placeholder="00000000000000"
          />
          <FormError message={errors.name?.message} />
        </div>

        <div className="flex gap-2">
          <div className="grid gap-1 flex-1">
            <Label htmlFor="owner_name">Nome</Label>
            <Input
              id="owner_name"
              {...register("owner_name")}
              placeholder="John"
            />
            <FormError message={errors.name?.message} />
          </div>

          <div className="grid gap-1 flex-1">
            <Label htmlFor="owner_surname">Sobrenome</Label>
            <Input
              id="owner_surname"
              {...register("owner_surname")}
              placeholder="Clark"
            />
            <FormError message={errors.name?.message} />
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="owner_email">Email</Label>
          <Input
            id="owner_email"
            type="email"
            {...register("owner_email")}
            placeholder="john.clark@gmail.com"
          />
          <FormError message={errors.name?.message} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="owner_phone">Telefone</Label>
          <Input
            id="owner_phone"
            {...register("owner_phone")}
            placeholder="11999999999"
          />
          <FormError message={errors.name?.message} />
        </div>

        {/* Senha */}
        <div className="grid gap-1 relative">
          <Label htmlFor="owner_password">Senha</Label>
          <div className="relative">
            <Input
              id="owner_password"
              type={showPassword ? "text" : "password"}
              {...register("owner_password")}
              placeholder="Crie uma senha forte"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <FormError message={errors.name?.message} />
        </div>

        {/* Confirmar senha */}
        <div className="grid gap-1 relative">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Repita sua senha"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
              onClick={() => setShowConfirmPassword(prev => !prev)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <FormError message={errors.name?.message} />
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
