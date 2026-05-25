"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, KeyRound, Mail, MessageCircle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTenantSlug } from "@/hooks/use-tenant-slug";
import { decodeJWTToken } from "@/utils/decode-jwt";
import { buildTenantPath } from "@/lib/tenant";

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export default function AccountSettings() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const tenant = useTenantSlug();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  // WhatsApp settings state
  const [waEnabled, setWaEnabled] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waPhoneError, setWaPhoneError] = useState<string | null>(null);
  const [waSaving, setWaSaving] = useState(false);

  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
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

  // Load WhatsApp settings on mount
  useEffect(() => {
    fetch("/api/company/whatsapp-settings")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setWaEnabled(data.whatsapp_notifications_enabled ?? false);
        setWaPhone(data.whatsapp_contact_phone ?? "");
      })
      .catch(() => {
        toast({
          title: "Erro ao carregar configurações WhatsApp",
          description: "Não foi possível buscar as configurações. Tente recarregar a página.",
          variant: "destructive",
        });
      });
  }, []);

  const handleResetPassword = async () => {
    if (!email || !tenant) {
      toast({
        title: "Dados incompletos",
        description:
          "Informe o e-mail e confirme o tenant antes de continuar.",
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
        body: JSON.stringify({ email, tenant, subdomain: tenant }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao solicitar reset de senha");
      }

      setSuccessEmail(email);
      toast({
        title: "Nova senha enviada",
        description: "Verifique sua caixa de entrada para continuar.",
      });
      setTimeout(() => {
        void signOut({
          callbackUrl: buildTenantPath(
            tenant,
            "/change-password",
            "/auth/employee/change-password"
          ),
        });
      }, 800);
    } catch (error) {
      toast({
        title: "Erro ao resetar senha",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveWhatsapp = async () => {
    if (waPhone && !E164_REGEX.test(waPhone)) {
      setWaPhoneError("Use o formato internacional: +55 11 99999-9999");
      return;
    }
    setWaPhoneError(null);
    setWaSaving(true);
    try {
      const res = await fetch("/api/company/whatsapp-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_notifications_enabled: waEnabled,
          whatsapp_contact_phone: waPhone || null,
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      toast({ title: "Configuracoes de WhatsApp salvas." });
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setWaSaving(false);
    }
  };

  return (
    <div className="branding-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
          <div className="space-y-6 pb-12 lg:pt-0">
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Notificacoes WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure o WhatsApp para envio de lembretes de agendamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="wa-enabled"
                    checked={waEnabled}
                    onCheckedChange={setWaEnabled}
                  />
                  <Label htmlFor="wa-enabled">Ativar notificacoes via WhatsApp</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-phone">Numero WhatsApp da empresa</Label>
                  <Input
                    id="wa-phone"
                    type="tel"
                    value={waPhone}
                    onChange={e => {
                      setWaPhone(e.target.value);
                      setWaPhoneError(null);
                    }}
                    placeholder="+5511999999999"
                  />
                  {waPhoneError && (
                    <p className="text-sm text-destructive">{waPhoneError}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="btn-gradient"
                    onClick={handleSaveWhatsapp}
                    disabled={waSaving}
                  >
                    {waSaving ? "Salvando..." : "Salvar"}
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
