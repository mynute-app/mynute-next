"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Screen =
  | "email"
  | "choose-type"
  | "client-password"
  | "company-email-sent"
  | "choose-reset-type"
  | "client-success"
  | "forgot-client-sent";

interface CheckEmailResponse {
  is_client: boolean;
  companies: { id: string; name: string; slug: string }[];
}

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkResult, setCheckResult] = useState<CheckEmailResponse | null>(null);
  const [companyEmailMode, setCompanyEmailMode] = useState<"login" | "reset">("login");

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setScreen("email");
      setEmail("");
      setPassword("");
      setError("");
      setCheckResult(null);
      setCompanyEmailMode("login");
    }
    onOpenChange(val);
  };

  const handleEmailSubmit = async (forgot: boolean) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/public/check-email?email=${encodeURIComponent(email)}`
      );
      const data: CheckEmailResponse = await res.json();

      if (!res.ok || (!data.is_client && data.companies.length === 0)) {
        setError("E-mail não encontrado. Verifique o endereço ou crie uma conta.");
        setIsLoading(false);
        return;
      }

      setCheckResult(data);
      const hasClient = data.is_client;
      const hasCompany = data.companies.length > 0;

      if (forgot) {
        if (hasClient && hasCompany) setScreen("choose-reset-type");
        else if (hasCompany) { await sendCompanyEmail("reset"); setScreen("company-email-sent"); }
        else { await sendClientForgot(); setScreen("forgot-client-sent"); }
      } else {
        if (hasClient && hasCompany) setScreen("choose-type");
        else if (hasCompany) { await sendCompanyEmail("login"); setScreen("company-email-sent"); }
        else setScreen("client-password");
      }
    } catch {
      setError("Erro ao verificar o e-mail. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendCompanyEmail = async (mode: "login" | "reset") => {
    setCompanyEmailMode(mode);
    const endpoint =
      mode === "login"
        ? "/api/public/send-company-login-email"
        : "/api/public/send-company-password-reset-email";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Falha ao enviar e-mail");
  };

  const sendClientForgot = async () => {
    const res = await fetch("/api/client/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Falha ao enviar e-mail");
  };

  const handleClientLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("E-mail ou senha incorretos. Tente novamente.");
        setIsLoading(false);
        return;
      }
      setScreen("client-success");
      setTimeout(() => router.push("/client/agendamentos"), 1500);
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseCompanyReset = async () => {
    setError("");
    setIsLoading(true);
    try { await sendCompanyEmail("reset"); setScreen("company-email-sent"); }
    catch { setError("Erro ao enviar o e-mail. Tente novamente."); }
    finally { setIsLoading(false); }
  };

  const handleChooseClientReset = async () => {
    setError("");
    setIsLoading(true);
    try { await sendClientForgot(); setScreen("forgot-client-sent"); }
    catch { setError("Erro ao enviar o e-mail. Tente novamente."); }
    finally { setIsLoading(false); }
  };

  const renderScreen = () => {
    switch (screen) {
      case "email":
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit(false)}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full btn-gradient"
              onClick={() => handleEmailSubmit(false)}
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Verificando..." : "Continuar"}
            </Button>
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                onClick={() => handleEmailSubmit(true)}
                disabled={isLoading || !email.trim()}
              >
                Esqueci a senha
              </button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Ainda não tem conta?</span>
                <Link
                  href="/auth/register-company"
                  className="text-foreground font-medium hover:underline"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        );

      case "choose-type":
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              O endereço{" "}
              <span className="font-medium text-foreground">{email}</span>{" "}
              possui registros tanto como cliente quanto como empresa.
            </p>
            <p className="text-sm text-muted-foreground">Como deseja entrar?</p>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setScreen("client-password")}
            >
              Entrar como cliente
            </Button>
            <Button
              className="w-full btn-gradient"
              onClick={async () => {
                setIsLoading(true);
                try { await sendCompanyEmail("login"); setScreen("company-email-sent"); }
                catch { setError("Erro ao enviar o e-mail. Tente novamente."); }
                finally { setIsLoading(false); }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Entrar como empresa"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              onClick={() => setScreen("email")}
            >
              ← Voltar
            </button>
          </div>
        );

      case "client-password":
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Digite a senha da conta de cliente para{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client-password-input">Senha</Label>
              <Input
                id="client-password-input"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClientLogin()}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full btn-gradient"
              onClick={handleClientLogin}
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              onClick={() =>
                setScreen(checkResult?.companies.length ? "choose-type" : "email")
              }
            >
              ← Voltar
            </button>
          </div>
        );

      case "company-email-sent":
        return (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <p className="text-base font-medium text-foreground">E-mail enviado!</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {companyEmailMode === "reset"
                ? "Verifique sua caixa de entrada. Você receberá um e-mail com o link para redefinição de senha de cada empresa em que está cadastrado."
                : "Verifique sua caixa de entrada. Você receberá um e-mail com os links de acesso para cada empresa em que está cadastrado."}
            </p>
            <Button variant="outline" className="mt-2" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        );

      case "choose-reset-type":
        return (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              O endereço{" "}
              <span className="font-medium text-foreground">{email}</span>{" "}
              possui registros tanto como cliente quanto como empresa.
            </p>
            <p className="text-sm text-muted-foreground">Qual senha deseja redefinir?</p>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleChooseClientReset}
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Redefinir senha de cliente"}
            </Button>
            <Button
              className="w-full btn-gradient"
              onClick={handleChooseCompanyReset}
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Redefinir senha de empresa"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              onClick={() => setScreen("email")}
            >
              ← Voltar
            </button>
          </div>
        );

      case "client-success":
        return (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✅
            </div>
            <p className="text-base font-medium text-foreground">Login realizado com sucesso!</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Você está conectado como cliente. Pode fechar esta janela.
            </p>
            <Button variant="outline" className="mt-2" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        );

      case "forgot-client-sent":
        return (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <p className="text-base font-medium text-foreground">Senha redefinida!</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Verifique seu e-mail para receber a nova senha. Não esqueça de
              verificar também a pasta de spam.
            </p>
            <Button variant="outline" className="mt-2" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        );
    }
  };

  const title: Record<Screen, string> = {
    email: "Entrar na sua conta",
    "choose-type": "Escolha o tipo de acesso",
    "client-password": "Digite sua senha",
    "company-email-sent": "Verifique seu e-mail",
    "choose-reset-type": "Redefinir senha",
    "client-success": "Acesso realizado",
    "forgot-client-sent": "E-mail enviado",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title[screen]}</DialogTitle>
        </DialogHeader>
        {renderScreen()}
      </DialogContent>
    </Dialog>
  );
}
