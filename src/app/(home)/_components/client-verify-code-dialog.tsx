"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useClientSendLoginCode } from "@/hooks/use-client-send-login-code";
import { useClientLoginWithCode } from "@/hooks/use-client-login-with-code";

const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, "O código deve ter 6 caracteres")
    .max(6, "O código deve ter 6 caracteres"),
});

type VerifyCodeData = z.infer<typeof verifyCodeSchema>;

interface ClientVerifyCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onSuccess: (token: string) => void;
}

export function ClientVerifyCodeDialog({
  open,
  onOpenChange,
  email,
  onSuccess,
}: ClientVerifyCodeDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerifyCodeData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const { token, loading: verifying, loginWithCode } = useClientLoginWithCode();
  const { loading: resending, sendVerificationCode } = useClientSendLoginCode();

  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasSentCode = useRef(false);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0 && open) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, open]);

  // Resetar estado quando abrir o dialog
  useEffect(() => {
    if (open) {
      reset();
      setError(null);
      setSuccess(false);
      setCanResend(false);
      setCountdown(60);
      hasSentCode.current = false;

      // Enviar código automaticamente quando abrir
      if (!hasSentCode.current) {
        sendVerificationCode(email);
        hasSentCode.current = true;
      }
    }
  }, [open, reset, email]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Quando login for bem-sucedido
  useEffect(() => {
    if (token && !success) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess(token);
        onOpenChange(false);
      }, 1500);
    }
  }, [token, success, onSuccess, onOpenChange]);

  const onSubmit = async (data: VerifyCodeData) => {
    setError(null);
    const result = await loginWithCode(email, data.code);

    if (!result) {
      setError("Código inválido ou expirado. Tente novamente.");
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    const result = await sendVerificationCode(email);
    if (result) {
      setCanResend(false);
      setCountdown(60);
      setError(null);
    } else {
      setError("Erro ao reenviar código. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Verificar código</DialogTitle>
          <DialogDescription>
            Enviamos um código de verificação para{" "}
            <strong className="text-foreground">{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificação</Label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}
              />
              {errors.code?.message && (
                <p className="text-sm text-red-500 text-center">
                  {errors.code.message}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 text-center font-medium">
                  ✅ Login realizado com sucesso!
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={verifying || success}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : success ? (
                "Redirecionando..."
              ) : (
                "Verificar e continuar"
              )}
            </Button>

            <div className="text-center text-sm">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-primary hover:underline underline-offset-4 disabled:opacity-50"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
