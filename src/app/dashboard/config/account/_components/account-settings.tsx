"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, KeyRound, Mail } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubdomain } from "@/hooks/use-subdomain";
import { decodeJWTToken } from "@/utils/decode-jwt";

export default function AccountSettings() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { companyId } = useSubdomain();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const accessToken = (session as { accessToken?: string } | null)
    ?.accessToken;
  const decoded = useMemo(
    () => (accessToken ? decodeJWTToken(accessToken) : null),
    [accessToken],
  );

  useEffect(() => {
    if (emailTouched) return;
    const nextEmail = decoded?.email ?? session?.user?.email ?? "";
    if (nextEmail) {
      setEmail(nextEmail);
    }
  }, [decoded?.email, emailTouched, session?.user?.email]);

  const resolveSubdomain = () => {
    if (companyId) return companyId;
    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname;
    if (hostname === "localhost") {
      const params = new URLSearchParams(window.location.search);
      return params.get("companyId");
    }

    const parts = hostname.split(".");
    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  };

  const handleResetPassword = async () => {
    const subdomain = resolveSubdomain();
    if (!email || !subdomain) {
      toast({
        title: "Dados incompletos",
        description:
          "Informe o e-mail e confirme o subdominio antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      setSuccessEmail(null);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subdomain }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erro ao solicitar reset de senha",
        );
      }

      setSuccessEmail(email);
      toast({
        title: "Nova senha enviada",
        description: "Verifique sua caixa de entrada para continuar.",
      });
      setTimeout(() => {
        void signOut({ callbackUrl: "/auth/employee/change-password" });
      }, 800);
    } catch (error) {
      toast({
        title: "Erro ao resetar senha",
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="branding-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
          <div className="space-y-6 pt-12 lg:pt-0">
            <div className="page-header">
              <h1 className="page-title">Conta e seguranca</h1>
              <p className="page-description">
                Atualize a senha e controle o acesso do seu usuario
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Reset de senha
                </CardTitle>
                <CardDescription>
                  Gere uma nova senha temporaria e envie para o e-mail do
                  usuario.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {successEmail && (
                  <Alert className="border-success/30 bg-success/10 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <div>
                      <AlertTitle>Senha enviada</AlertTitle>
                      <AlertDescription>
                        A nova senha foi enviada para {successEmail}.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="account-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="account-email"
                      type="email"
                      value={email}
                      onChange={event => {
                        setEmail(event.target.value);
                        setEmailTouched(true);
                      }}
                      placeholder="seu.email@empresa.com"
                      className="pl-9 input-focus"
                    />
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Uma senha temporaria sera enviada. Lembre-se de alterar a
                    senha apos o proximo login.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Subdominio: {resolveSubdomain() || "nao identificado"}
                  </p>
                  <Button
                    type="button"
                    className="btn-gradient"
                    onClick={handleResetPassword}
                    disabled={isSending || !email}
                  >
                    {isSending ? "Enviando..." : "Enviar nova senha"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
