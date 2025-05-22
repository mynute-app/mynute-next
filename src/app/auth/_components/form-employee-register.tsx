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
import {
  formatCNPJ,
  formatPhone,
  preparePhoneToSubmit,
  unmask,
} from "@/utils/format-cnpj";

export function RegisterFormCompany({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<CompanyRegisterSchema>({
    resolver: zodResolver(companyRegisterSchema),
  });
  console.log("📛 Errors:", errors);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { submit } = useCreateCompany();

  const onSubmit = async (data: CompanyRegisterSchema) => {
    try {
      const cleanData = {
        ...data,
        tax_id: unmask(data.tax_id),
        owner_phone: preparePhoneToSubmit(data.owner_phone),
      };

      await submit(cleanData);

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Você será redirecionado para o login.",
      });

      router.push("/auth/employee");
    } catch (err) {
      const errorMessage = (err as Error).message;
      const normalizedMessage = errorMessage.toLowerCase();

      const constraintMap: Record<
        string,
        { field: keyof CompanyRegisterSchema; message: string }
      > = {
        uni_companies_name: {
          field: "name",
          message: "Já existe uma empresa com esse nome.",
        },
        uni_companies_tax_id: {
          field: "tax_id",
          message: "Já existe uma empresa com esse CNPJ.",
        },
        idx_employees_email: {
          field: "owner_email",
          message: "Já existe uma conta com esse e-mail.",
        },
        idx_employees_phone: {
          field: "owner_phone",
          message: "Já existe uma conta com esse telefone.",
        },
      };

      const matchedConstraint = Object.entries(constraintMap).find(
        ([constraint]) =>
          normalizedMessage.includes("duplicate key") &&
          normalizedMessage.includes(constraint)
      );

      if (matchedConstraint) {
        const [, { field, message }] = matchedConstraint;

        setError(field, {
          type: "manual",
          message,
        });

        toast({
          title: "Erro ao cadastrar empresa",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar empresa",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-2", className)}
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
            placeholder="00.000.000/0000-00"
            {...register("tax_id")}
            onChange={e => {
              const formatted = formatCNPJ(e.target.value);
              setValue("tax_id", formatted);
            }}
          />
          <FormError message={errors.tax_id?.message} />
        </div>

        <div className="flex gap-2">
          <div className="grid gap-1 flex-1">
            <Label htmlFor="owner_name">Nome</Label>
            <Input
              id="owner_name"
              {...register("owner_name")}
              placeholder="John"
            />
            <FormError message={errors.owner_name?.message} />
          </div>

          <div className="grid gap-1 flex-1">
            <Label htmlFor="owner_surname">Sobrenome</Label>
            <Input
              id="owner_surname"
              {...register("owner_surname")}
              placeholder="Clark"
            />
            <FormError message={errors.owner_surname?.message} />
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
          <FormError message={errors.owner_email?.message} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="owner_phone">Telefone</Label>
          <Input
            id="owner_phone"
            {...register("owner_phone")}
            placeholder="(11) 99999-9999"
            onChange={e => {
              const formatted = formatPhone(e.target.value);
              setValue("owner_phone", formatted);
            }}
          />
          <FormError message={errors.owner_phone?.message} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="trading_name">Nome fantasia</Label>
          <Input
            id="trading_name"
            {...register("trading_name")}
            placeholder="Agenda"
          />
          <FormError message={errors.trading_name?.message} />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="start_subdomain">Subdomínio</Label>
          <Input
            id="start_subdomain"
            {...register("start_subdomain")}
            placeholder="agenda-yourcompany2"
          />
          <FormError message={errors.start_subdomain?.message} />
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
          <FormError message={errors.owner_password?.message} />
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
          <FormError message={errors.confirmPassword?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Já tem uma conta?{" "}
        <Link href="/auth/employee" className="underline underline-offset-4">
          Faça login
        </Link>
      </div>
    </form>
  );
}
