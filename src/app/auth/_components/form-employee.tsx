"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
  provider: "user-login" | "employee-login";
};

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginFormEmployee({
  className,
  provider,
  ...props
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    const result = await signIn(provider, {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Falha no login. Verifique suas credenciais.");
    } else {
      router.push("/dashboard/your-brand");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Faça login na sua conta</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Insira seu e-mail abaixo para fazer login
        </p>
      </div>

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

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
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
          {errors.password?.message && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Login"}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Ou continue com
          </span>
        </div>

        <Button variant="outline" className="w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 mr-2"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12..." fill="currentColor" />
          </svg>
          Login com GitHub
        </Button>
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
