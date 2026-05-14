"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  User,
  Loader2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
import { useClientSendLoginCode } from "@/hooks/use-client-send-login-code";
import type { Service } from "../../../../types/company";
import { ClientVerifyCodeDialog } from "./client-verify-code-dialog";
import { decodeJWTToken } from "@/utils/decode-jwt";
import { formatPhone } from "@/utils/format-cnpj";
import { ServiceDescription } from "@/components/services/service-description";

interface ClientDetailsFormProps {
  service: Service;
  selectedSlot: {
    date: string;
    time: string;
    branchId: string;
    employeeId: string;
  };
  branches: any[];
  employees: any[];
  brandColor?: string;
  onSubmit: (clientData: ClientData) => void;
  onBack: () => void;
}

export interface ClientData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  notes?: string;
}

export function ClientDetailsForm({
  service,
  selectedSlot,
  branches,
  employees,
  brandColor,
  onSubmit,
  onBack,
}: ClientDetailsFormProps) {
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    surname: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [didAttemptCreate, setDidAttemptCreate] = useState(false);

  const {
    client,
    loading,
    error: clientError,
    checkEmail,
  } = useClientByEmail();

  const {
    createClient,
    loading: creatingClient,
    error: createClientError,
  } = useCreateClient();
  const { sendVerificationCode, loading: sendingCode } =
    useClientSendLoginCode();

  const selectedEmployee = employees.find(
    (emp: any) => emp.id === selectedSlot.employeeId,
  );
  const selectedBranch = branches.find(
    (branch: any) => branch.id === selectedSlot.branchId,
  );

  // Verificar se jÃ¡ existe token no localStorage ao carregar
  useEffect(() => {
    const storedToken = localStorage.getItem("client_token");

    if (storedToken) {
      const userData = decodeJWTToken(storedToken);

      if (userData) {
        // Preencher os dados do formulÃ¡rio com os dados do token
        setClientData({
          name: userData.name,
          surname: userData.surname,
          phone: userData.phone,
          email: userData.email,
          notes: "",
        });

        setClientToken(storedToken);
        setIsLoggedIn(true);
        setEmailValidated(true);

        // Buscar dados completos do cliente
        checkEmail(userData.email);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("client_token");
    setClientToken(null);
    setIsLoggedIn(false);
    setEmailValidated(false);
    setClientData({
      name: "",
      surname: "",
      phone: "",
      email: "",
      notes: "",
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailValidation = async () => {
    const email = clientData.email.trim();

    // Limpar erros anteriores
    setErrors(prev => ({ ...prev, email: "" }));

    if (!email) {
      setErrors(prev => ({ ...prev, email: "Email Ã© obrigatÃ³rio" }));
      return;
    }

    if (!validateEmail(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Digite um email vÃ¡lido (exemplo: seu@email.com)",
      }));
      return;
    }

    // Email vÃ¡lido, buscar no servidor
    setIsCheckingEmail(true);
    await checkEmail(email);
    setIsCheckingEmail(false);
    setEmailValidated(true);
  };

  // Preencher campos automaticamente quando cliente for encontrado (verificado ou nÃ£o)
  useEffect(() => {
    if (client) {
      setClientData(prev => ({
        ...prev,
        name: client.name || prev.name,
        surname: client.surname || prev.surname,
        phone: client.phone || prev.phone,
      }));
    }
  }, [client]);

  useEffect(() => {
    if (!didAttemptCreate || !createClientError) {
      return;
    }

    const error =
      typeof createClientError === "string" ? createClientError : "";

    if (!error) {
      return;
    }

    const phoneDuplicate =
      error === "PHONE_DUPLICATE" ||
      error.includes("idx_public_clients_phone") ||
      (error.includes("duplicate key") && error.includes("phone"));
    if (phoneDuplicate) {
      setErrors(prev => ({
        ...prev,
        phone: "Este nÃºmero de telefone jÃ¡ estÃ¡ cadastrado. Use outro nÃºmero.",
      }));
      return;
    }

    if (
      error === "EMAIL_DUPLICATE" ||
      error.includes("idx_public_clients_email") ||
      (error.includes("duplicate key") && error.includes("email"))
    ) {
      setErrors(prev => ({
        ...prev,
        email: "Este email jÃ¡ estÃ¡ cadastrado.",
      }));
      return;
    }

    setErrors(prev => {
      if (prev.email || prev.phone) {
        return prev;
      }
      return {
        ...prev,
        phone: error || "Erro ao criar conta. Tente novamente.",
      };
    });
  }, [createClientError, didAttemptCreate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!clientData.email.trim()) {
      newErrors.email = "Email Ã© obrigatÃ³rio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email.trim())) {
      newErrors.email = "Email deve ter um formato vÃ¡lido";
    }

    if (!clientData.name.trim()) {
      newErrors.name = "Nome Ã© obrigatÃ³rio";
    }

    if (!clientData.surname.trim()) {
      newErrors.surname = "Sobrenome Ã© obrigatÃ³rio";
    }

    if (!clientData.phone.trim()) {
      newErrors.phone = "Telefone Ã© obrigatÃ³rio";
    } else if (!/^[\d\s\-\(\)\+]+$/.test(clientData.phone.trim())) {
      newErrors.phone = "Telefone deve conter apenas nÃºmeros";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    // Limpar erros anteriores
    setErrors({});
    setDidAttemptCreate(true);

    // Chama createClient e aguarda o erro mais recente diretamente
    const created = await createClient({
      email: clientData.email.trim(),
      name: clientData.name.trim(),
      surname: clientData.surname.trim(),
      phone: clientData.phone.trim(),
      password: "Senha123!",
    });

    if (!created) {
      return;
    }

    await checkEmail(clientData.email.trim());
  };

  const handleLogin = async () => {
    if (!validateEmail(clientData.email.trim())) {
      setErrors(prev => ({
        ...prev,
        email: "Digite um email vÃ¡lido antes de fazer login",
      }));
      return;
    }

    const codeSent = await sendVerificationCode(clientData.email.trim());

    if (!codeSent) {
      setErrors(prev => ({
        ...prev,
        email: "Erro ao enviar cÃ³digo. Verifique seu email e tente novamente.",
      }));
      return;
    }

    setIsVerifyDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!clientToken) {
      return;
    }

    onSubmit({
      ...clientData,
      name: clientData.name.trim(),
      surname: clientData.surname.trim(),
      phone: clientData.phone.trim(),
      email: clientData.email.trim(),
      notes: clientData.notes?.trim(),
    });
  };

  const handleVerificationSuccess = (token: string) => {
    localStorage.setItem("client_token", token);

    const userData = decodeJWTToken(token);

    setClientToken(token);
    setIsLoggedIn(true);

    setIsVerifyDialogOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-foreground">Seus dados</h2>
          <p className="text-xs text-muted-foreground">Preencha seus dados para finalizar o agendamento</p>
        </div>
      </div>

      {/* Card principal de dados */}
      <div className="rounded-xl border border-border bg-card shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)]">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <User className="w-4 h-4 text-muted-foreground" />
            {isLoggedIn ? "Seus dados" : "InformaÃ§Ãµes pessoais"}
          </div>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Trocar email
            </button>
          )}
        </div>

        {/* Card content */}
        <div className="p-4 space-y-4">
          {isLoggedIn ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Nome</p>
                  <p className="text-sm font-medium text-foreground">{clientData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Sobrenome</p>
                  <p className="text-sm font-medium text-foreground">{clientData.surname}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm font-medium text-foreground break-all">{clientData.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                <p className="text-sm font-medium text-foreground">
                  {formatPhone(clientData.phone.replace(/^\+55/, ""))}
                </p>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-border">
                <Label htmlFor="notes" className="text-sm">ObservaÃ§Ãµes <span className="text-muted-foreground">(opcional)</span></Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observaÃ§Ã£o ou preferÃªncia especial..."
                  value={clientData.notes}
                  onChange={e => setClientData({ ...clientData, notes: e.target.value })}
                  rows={3}
                  className="rounded-lg border-border resize-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Campo Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm flex items-center gap-2">
                  Email *
                  {isCheckingEmail && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={clientData.email}
                    onChange={e => {
                      setClientData({ ...clientData, email: e.target.value });
                      setEmailValidated(false);
                      setErrors(prev => ({ ...prev, email: "" }));
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); handleEmailValidation(); }
                    }}
                    className={`rounded-lg border-border ${errors.email ? "border-destructive" : ""}`}
                    disabled={isCheckingEmail}
                  />
                  {!emailValidated && (
                    <Button
                      type="button"
                      onClick={handleEmailValidation}
                      disabled={isCheckingEmail || !clientData.email.trim()}
                      variant="secondary"
                      className="rounded-lg shrink-0"
                    >
                      {isCheckingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
                    </Button>
                  )}
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </div>
                )}

                {emailValidated && !clientError && client && (
                  <div className="flex items-center gap-2 p-2.5 bg-[hsl(142_72%_50%/0.08)] border border-[hsl(142_72%_50%/0.2)] rounded-lg text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="text-green-700 font-medium">Email encontrado!</span>
                  </div>
                )}

                {emailValidated && clientError === "Cliente nÃ£o encontrado" && (
                  <div className="flex items-center gap-2 p-2.5 bg-muted border border-border rounded-lg text-xs">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Email disponÃ­vel para criar conta</span>
                  </div>
                )}

                {emailValidated && client && !client.verified && (
                  <div className="p-2.5 bg-[hsl(38_92%_50%/0.08)] border border-[hsl(38_92%_50%/0.2)] rounded-lg text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <p className="font-medium text-amber-700">Email nÃ£o verificado</p>
                    </div>
                    <p className="text-amber-600 pl-5">Clique em "Fazer login" para verificar seu email e continuar.</p>
                  </div>
                )}
              </div>

              {/* Campos restantes */}
              {emailValidated && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Digite seu nome"
                      value={clientData.name}
                      onChange={e => setClientData({ ...clientData, name: e.target.value })}
                      className={`rounded-lg border-border ${errors.name ? "border-destructive" : ""}`}
                      disabled={client !== null && clientError !== "Cliente nÃ£o encontrado"}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="surname" className="text-sm">Sobrenome *</Label>
                    <Input
                      id="surname"
                      placeholder="Digite seu sobrenome"
                      value={clientData.surname}
                      onChange={e => setClientData({ ...clientData, surname: e.target.value })}
                      className={`rounded-lg border-border ${errors.surname ? "border-destructive" : ""}`}
                      disabled={client !== null && clientError !== "Cliente nÃ£o encontrado"}
                    />
                    {errors.surname && <p className="text-xs text-destructive">{errors.surname}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm">Telefone *</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={clientData.phone}
                      onChange={e => {
                        const formatted = formatPhone(e.target.value);
                        setClientData({ ...clientData, phone: formatted });
                      }}
                      className={`rounded-lg border-border ${errors.phone ? "border-destructive" : ""}`}
                      disabled={client !== null && clientError !== "Cliente nÃ£o encontrado"}
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-sm">ObservaÃ§Ãµes <span className="text-muted-foreground">(opcional)</span></Label>
                    <Textarea
                      id="notes"
                      placeholder="Alguma observaÃ§Ã£o ou preferÃªncia especial..."
                      value={clientData.notes}
                      onChange={e => setClientData({ ...clientData, notes: e.target.value })}
                      rows={3}
                      className="rounded-lg border-border resize-none"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Card resumo */}
      <div className="rounded-xl border border-border bg-card shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] divide-y divide-border">
        <div className="px-4 py-3 text-sm font-medium text-foreground">Resumo do agendamento</div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">{service.name}</p>
              <ServiceDescription
                description={service.description}
                maxItemsCollapsed={2}
                className="mt-0.5"
                introClassName="text-xs text-muted-foreground"
                listClassName="text-xs text-muted-foreground"
                toggleClassName="text-xs text-muted-foreground"
              />
              {service.price && (
                <p className="text-xs text-muted-foreground mt-0.5">R$ {service.price.toFixed(2)}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground capitalize">{formatDate(selectedSlot.date)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(selectedSlot.time)}
                {service.duration && ` Â· ${service.duration} min`}
              </p>
            </div>
          </div>

          {selectedEmployee && (
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="font-medium text-foreground">{selectedEmployee.name}</p>
            </div>
          )}

          {selectedBranch && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">{selectedBranch.name}</p>
                {selectedBranch.address && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedBranch.address}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BotÃ£o de aÃ§Ã£o */}
      <div className="pt-1">{renderActionButton()}</div>

      <ClientVerifyCodeDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        email={clientData.email}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );

  function renderActionButton() {
    if (isLoggedIn && clientToken) {
      return (
        <Button
          size="lg"
          className="w-full rounded-lg h-11 font-semibold"
          style={{ backgroundColor: brandColor, color: "#fff", borderColor: brandColor }}
          onClick={handleSubmit}
        >
          Finalizar agendamento
        </Button>
      );
    }

    if (emailValidated && clientError === "Cliente nÃ£o encontrado") {
      return (
        <Button
          size="lg"
          className="w-full rounded-lg h-11 font-semibold"
          style={{ backgroundColor: brandColor, color: "#fff", borderColor: brandColor }}
          onClick={handleCreateAccount}
        >
          {creatingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
        </Button>
      );
    }

    if (emailValidated && client && !client.verified) {
      return (
        <Button
          size="lg"
          className="w-full rounded-lg h-11 font-semibold"
          style={{ backgroundColor: brandColor, color: "#fff", borderColor: brandColor }}
          onClick={handleLogin}
        >
          {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fazer login"}
        </Button>
      );
    }

    if (emailValidated && client && client.verified && !isLoggedIn) {
      return (
        <Button
          size="lg"
          className="w-full rounded-lg h-11 font-semibold"
          style={{ backgroundColor: brandColor, color: "#fff", borderColor: brandColor }}
          onClick={handleLogin}
        >
          {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fazer login"}
        </Button>
      );
    }

    return (
      <Button
        size="lg"
        className="w-full rounded-lg h-11 font-semibold"
        style={{ backgroundColor: brandColor, color: "#fff", borderColor: brandColor }}
        disabled
      >
        Finalizar agendamento
      </Button>
    );
  }
}
