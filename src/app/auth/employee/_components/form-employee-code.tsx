"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSendLoginCode } from "@/hooks/use-send-login-code";

const codeLoginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type CodeLoginData = z.infer<typeof codeLoginSchema>;

type CodeLoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
  onToggleMode?: () => void;
};

export function LoginFormCode({
  className,
  onToggleMode,
  ...props
}: CodeLoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeLoginData>({
    resolver: zodResolver(codeLoginSchema),
  });

  const { sendCode, loading, error } = useSendLoginCode();
  const router = useRouter();

  const onSubmit = async (data: CodeLoginData) => {
    const success = await sendCode(data.email);
    if (success) {
      router.push(`/auth/verify-code?email=${encodeURIComponent(data.email)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando código..." : "Receber código"}
        </Button>

        {onToggleMode && (
          <>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onToggleMode}
            >
              Login com senha
            </Button>
          </>
        )}
      </div>

      <div className="text-center text-sm">
        Não tem uma conta?{" "}
        <Link
          href="/auth/register-company"
          className="underline underline-offset-4"
        >
          Cadastre-se
        </Link>
      </div>
    </form>
  );
}
