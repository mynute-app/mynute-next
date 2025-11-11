"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useVerifyLoginCode } from "@/hooks/use-verify-login-code";
import { useSendLoginCode } from "@/hooks/use-send-login-code";
import Link from "next/link";

const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, "O código deve ter 6 caracteres")
    .max(6, "O código deve ter 6 caracteres"),
});

type VerifyCodeData = z.infer<typeof verifyCodeSchema>;

export function VerifyCodeForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const { verifyCode, loading: verifying } = useVerifyLoginCode();
  const { sendCode, loading: resending } = useSendLoginCode();
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyCodeData) => {
    if (!emailFromParams) {
      return;
    }
    await verifyCode(emailFromParams, data.code);
  };

  const handleResendCode = async () => {
    if (!emailFromParams || !canResend) return;

    const success = await sendCode(emailFromParams);
    if (success) {
      setCanResend(false);
      setCountdown(60);
    }
  };

  if (!emailFromParams) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <Alert variant="destructive">
          <AlertDescription>
            Email não identificado. Por favor, volte e tente novamente.
          </AlertDescription>
        </Alert>
        <Link href="/auth/register-company">
          <Button variant="outline" className="w-full">
            Voltar para o cadastro
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="code">Código de verificação</Label>
          <div className="text-sm text-muted-foreground mb-2">
            Enviamos um código para <strong>{emailFromParams}</strong>
          </div>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            maxLength={6}
            {...register("code")}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            autoComplete="one-time-code"
          />
          {errors.code?.message && (
            <p className="text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={verifying}>
          {verifying ? "Verificando..." : "Verificar e fazer login"}
        </Button>

        <div className="text-center text-sm">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-primary hover:underline underline-offset-4"
            >
              {resending ? "Reenviando..." : "Reenviar código"}
            </button>
          ) : (
            <p className="text-muted-foreground">
              Reenviar código em {countdown}s
            </p>
          )}
        </div>
      </div>

      <div className="text-center text-sm">
        <Link
          href="/auth/employee"
          className="text-muted-foreground hover:underline underline-offset-4"
        >
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}
