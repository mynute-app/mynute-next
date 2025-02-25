"use client";

import { RegisterFormData } from "../models/registerSchema";

export async function registerUser(
  data: RegisterFormData,
  setError: any,
  reset: any,
  router: any,
  toast: any
) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response.json();
      if (result.field && result.message) {
        setError(result.field as keyof RegisterFormData, {
          message: result.message,
        });
      } else {
        setError("root", { message: result.message || "Erro ao registrar." });
      }
      return;
    }

    toast({
      title: "✅ Cadastro realizado!",
      description: "Seu usuário foi cadastrado com sucesso.",
      duration: 3000,
      variant: "default",
    });

    reset();
    router.push("/login");
  } catch (error: any) {
    setError("root", { message: "Erro ao registrar. Tente novamente." });
  }
}
