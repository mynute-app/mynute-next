"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterFormData, registerSchema } from "../models/registerSchema";
import { registerUser } from "../services/registerService";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Registro</CardTitle>
        <CardDescription>
          Crie sua conta preenchendo os campos abaixo
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit(data => registerUser(data, setError, reset))}
      >
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={errors.email ? "text-red-500" : ""}
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              {...register("email")}
              className={
                errors.email ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className={errors.phone ? "text-red-500" : ""}
            >
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Digite seu telefone"
              {...register("phone")}
              className={
                errors.phone ? "border-red-500 focus:border-red-500" : ""
              }
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Digite seu nome"
              {...register("name")}
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              {...register("password")}
            />
          </div>

          {/* ID da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company_id">ID da Empresa</Label>
            <Input
              id="company_id"
              type="number"
              placeholder="Digite o ID da empresa"
              {...register("company_id", { valueAsNumber: true })}
            />
          </div>

          {/* Erro Geral */}
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar-se"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
