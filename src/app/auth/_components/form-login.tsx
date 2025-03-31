"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FcGoogle } from "react-icons/fc";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError("Email ou senha inválidos");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-4 shadow-lg rounded-xl bg-white border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Login
          </CardTitle>
          <CardDescription>Entre com suas credenciais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="flex items-center px-4 py-2">
              <FcGoogle className=" h-5 w-5" />
            </Button>
          </div>
          <div className="relative flex items-center py-2">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-gray-500 text-sm">ou</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                className="h-10"
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="text-sm text-red-500">
                  {String(errors.email.message)}
                </p>
              )}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="h-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
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
                <p className="text-sm text-red-500">
                  {String(errors.password.message)}
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Button
                type="submit"
                className="w-full bg-[#1a2b47] hover:bg-[#152742] h-10"
              >
                Login
              </Button>
            </div>
          </form>
          <div className="text-end mt-2 ">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <p className="text-sm text-gray-600 text-center mt-4">
            Ainda não tem conta?
            <Link
              href="/auth/register-client"
              className="text-blue-600 font-semibold hover:underline ml-2"
            >
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
