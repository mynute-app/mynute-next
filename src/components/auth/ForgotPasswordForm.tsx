"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSubdomain } from "@/hooks/use-subdomain";

const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const subdomain = useSubdomain();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          subdomain: subdomain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao solicitar reset de senha");
      }

      setSuccess(true);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para a nova senha.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="grid gap-4 text-center">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="text-base font-semibold">E-mail enviado!</span>
        </div>
        <p className="text-muted-foreground">
          Enviamos uma nova senha para <strong>{getValues("email")}</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          Verifique sua caixa de entrada e use a nova senha para fazer login.
        </p>
        <Link href="/auth/employee">
          <Button className="w-full">Voltar para Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar Nova Senha"}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/auth/employee"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Login
        </Link>
      </div>

      <Alert>
        <AlertDescription>
          Você receberá uma senha temporária. Lembre-se de alterá-la após fazer
          login.
        </AlertDescription>
      </Alert>
    </div>
  );
}
