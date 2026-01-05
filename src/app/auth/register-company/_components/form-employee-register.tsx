"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCreateCompany } from "@/hooks/create-company";
import { useState, useEffect } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { formatCNPJ, formatPhone } from "@/utils/format-cnpj";
import { FormError } from "./form-error";
import {
  companyRegisterSchema,
  CompanyRegisterSchema,
} from "../../../../../schema/company-register";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterFormCompany({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
  } = useForm<CompanyRegisterSchema>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      owner_time_zone: "America/Sao_Paulo",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { submit } = useCreateCompany();
  const timeZone = watch("owner_time_zone");

  const onSubmit = async (data: CompanyRegisterSchema) => {
    await submit(data, setError);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-1.5 sm:gap-2", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-0.5 text-center mb-1">
        <h1 className="text-lg sm:text-xl font-bold">Crie sua empresa</h1>
        <p className="text-balance text-xs sm:text-sm text-muted-foreground">
          Preencha os dados abaixo para cadastrar sua empresa
        </p>
      </div>

      <div className="grid gap-1 sm:gap-1.5">
        <div className="grid gap-0.5">
          <Label htmlFor="name" className="text-xs sm:text-sm">
            Nome da Empresa
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Waffle Tech"
            className="h-9"
          />
          <FormError message={errors.name?.message} />
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          <div className="grid gap-0.5 flex-1">
            <Label htmlFor="owner_name" className="text-xs sm:text-sm">
              Nome
            </Label>
            <Input
              id="owner_name"
              {...register("owner_name")}
              placeholder="John"
              className="h-9"
            />
            <FormError message={errors.owner_name?.message} />
          </div>

          <div className="grid gap-0.5 flex-1">
            <Label htmlFor="owner_surname" className="text-xs sm:text-sm">
              Sobrenome
            </Label>
            <Input
              id="owner_surname"
              {...register("owner_surname")}
              placeholder="Clark"
              className="h-9"
            />
            <FormError message={errors.owner_surname?.message} />
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          <div className="grid gap-0.5 flex-1">
            <Label htmlFor="owner_email" className="text-xs sm:text-sm">
              Email
            </Label>
            <Input
              id="owner_email"
              type="email"
              {...register("owner_email")}
              placeholder="john.clark@gmail.com"
              className="h-9"
            />
            <FormError message={errors.owner_email?.message} />
          </div>

          <div className="grid gap-0.5 flex-1">
            <Label htmlFor="tax_id" className="text-xs sm:text-sm">
              CNPJ
            </Label>
            <Input
              id="tax_id"
              placeholder="00.000.000/0000-00"
              {...register("tax_id")}
              className="h-9"
              onChange={e => {
                const formatted = formatCNPJ(e.target.value);
                setValue("tax_id", formatted);
              }}
            />
            <FormError message={errors.tax_id?.message} />
          </div>
        </div>
        <div className="grid gap-0.5">
          <Label htmlFor="owner_phone" className="text-xs sm:text-sm">
            Telefone
          </Label>
          <Input
            id="owner_phone"
            {...register("owner_phone")}
            placeholder="(11) 99999-9999"
            className="h-9"
            onChange={e => {
              const formatted = formatPhone(e.target.value);
              setValue("owner_phone", formatted);
            }}
          />
          <FormError message={errors.owner_phone?.message} />
        </div>

        <div className="grid gap-0.5">
          <Label htmlFor="owner_time_zone" className="text-xs sm:text-sm">
            Fuso Horário
          </Label>
          <Select
            onValueChange={value => setValue("owner_time_zone", value)}
            value={timeZone}
          >
            <SelectTrigger id="owner_time_zone" className="h-9">
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">
                Brasil (Brasília - GMT-3)
              </SelectItem>
              <SelectItem value="America/New_York">
                EUA - Costa Leste (Nova York - GMT-5)
              </SelectItem>
              <SelectItem value="America/Los_Angeles">
                EUA - Costa Oeste (Los Angeles - GMT-8)
              </SelectItem>
              <SelectItem value="Europe/London">
                Europa (Londres - GMT+0)
              </SelectItem>
              <SelectItem value="Asia/Tokyo">Ásia (Tóquio - GMT+9)</SelectItem>
            </SelectContent>
          </Select>
          <FormError message={errors.owner_time_zone?.message} />
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <div className="grid gap-0.5 flex-1">
            <Label htmlFor="trading_name" className="text-xs sm:text-sm">
              Nome fantasia
            </Label>
            <Input
              id="trading_name"
              {...register("trading_name")}
              placeholder="Agenda"
              className="h-9"
            />
            <FormError message={errors.trading_name?.message} />
          </div>

          <div className="grid gap-0.5 flex-1">
            <Label htmlFor="start_subdomain" className="text-xs sm:text-sm">
              Subdomínio
            </Label>
            <Input
              id="start_subdomain"
              {...register("start_subdomain")}
              placeholder="agenda-yourcompany2"
              className="h-9"
            />
            <FormError message={errors.start_subdomain?.message} />
          </div>
        </div>
        {/* Senha */}
        <div className="grid gap-0.5 relative">
          <Label htmlFor="owner_password" className="text-xs sm:text-sm">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="owner_password"
              type={showPassword ? "text" : "password"}
              {...register("owner_password")}
              placeholder="Crie uma senha forte"
              className="pr-10 h-9"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <FormError message={errors.owner_password?.message} />
        </div>

        {/* Confirmar senha */}
        <div className="grid gap-0.5 relative">
          <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
            Confirmar senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Repita sua senha"
              className="pr-10 h-9"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
              onClick={() => setShowConfirmPassword(prev => !prev)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <FormError message={errors.confirmPassword?.message} />
        </div>

        <Button
          type="submit"
          className="w-full mt-1 h-9"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </div>

      <div className="text-center text-xs sm:text-sm">
        Já tem uma conta?{" "}
        <Link href="/auth/employee" className="underline underline-offset-4">
          Faça login
        </Link>
      </div>
    </form>
  );
}
