"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
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

// 📌 Definição do schema de validação com Zod
const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  phone: z
    .string()
    .min(10, "O telefone deve ter pelo menos 10 dígitos")
    .max(11, "O telefone deve ter no máximo 11 dígitos"),
  company_id: z.number().min(1, "O ID da empresa deve ser um número válido"),
});

// 📌 Tipagem do formulário baseada no schema do Zod
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.field as keyof RegisterFormData, {
          message: result.message,
        });
        return;
      }

      // Se der certo, redireciona e limpa o formulário
      reset();
      router.push("/login");
    } catch (error: any) {
      setError("root", { message: "Erro ao registrar. Tente novamente." });
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Registro</CardTitle>
        <CardDescription>
          Crie sua conta preenchendo os campos abaixo
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
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

          {/* Outros campos */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Digite seu nome"
              {...register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              {...register("password")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">ID da Empresa</Label>
            <Input
              id="company_id"
              type="number"
              placeholder="Digite o ID da empresa"
              {...register("company_id", { valueAsNumber: true })}
            />
          </div>

          {/* Erro geral */}
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
