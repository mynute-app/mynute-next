"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  CheckCircle,
  EyeIcon,
  EyeOffIcon,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const changePasswordSchema = z
  .object({
    email: z.string().email("Digite um e-mail valido"),
    currentPassword: z.string().min(1, "Informe a senha temporaria"),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a nova senha"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "As senhas nao conferem",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const getSubdomain = () => {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    const params = new URLSearchParams(window.location.search);
    return params.get("companyId");
  }
  const parts = hostname.split(".");
  return parts.length > 2 ? parts[0] : null;
};

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setLoading(true);
      const subdomain = getSubdomain();

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
          subdomain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erro ao atualizar a senha. Tente novamente.",
        );
      }

      setSuccess(true);
      toast({
        title: "Senha atualizada!",
        description: "Agora voce ja pode entrar com a nova senha.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar senha",
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <Skeleton className="h-6 w-44" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Senha atualizada!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            A nova senha foi salva para <strong>{getValues("email")}</strong>.
          </p>
          <Link href="/auth/employee">
            <Button className="w-full">Voltar para Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Atualizar senha temporaria
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use a senha recebida no e-mail para criar uma nova senha.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@empresa.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha temporaria</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                className={
                  errors.currentPassword ? "border-red-500 pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                onClick={() => setShowCurrent(prev => !prev)}
              >
                {showCurrent ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                {...register("newPassword")}
                className={
                  errors.newPassword ? "border-red-500 pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                onClick={() => setShowNew(prev => !prev)}
              >
                {showNew ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                className={
                  errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                onClick={() => setShowConfirm(prev => !prev)}
              >
                {showConfirm ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Atualizar senha"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/auth/employee"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Login
          </Link>
        </div>

        <Alert className="mt-4">
          <AlertDescription>
            Depois de atualizar sua senha, use a nova senha para entrar.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
