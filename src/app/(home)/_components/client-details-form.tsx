"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
import { useClientSendLoginCode } from "@/hooks/use-client-send-login-code";
import type { Service } from "../../../../types/company";
import { ClientVerifyCodeDialog } from "./client-verify-code-dialog";
import { decodeJWTToken } from "@/utils/decode-jwt";
import { formatPhone } from "@/utils/format-cnpj";

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

  const {
    client,
    loading,
    error: clientError,
    checkEmail,
  } = useClientByEmail();

  const { createClient, loading: creatingClient } = useCreateClient();
  const { sendVerificationCode, loading: sendingCode } =
    useClientSendLoginCode();

  const selectedEmployee = employees.find(
    (emp: any) => emp.id === selectedSlot.employeeId
  );
  const selectedBranch = branches.find(
    (branch: any) => branch.id === selectedSlot.branchId
  );

  // Verificar se já existe token no localStorage ao carregar
  useEffect(() => {
    const storedToken = localStorage.getItem("client_token");

    if (storedToken) {
      console.log("🔑 Token encontrado no localStorage:", storedToken);

      const userData = decodeJWTToken(storedToken);
      console.log("📋 Dados decodificados do token:", userData);

      if (userData) {
        // Preencher os dados do formulário com os dados do token
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
    console.log("👋 Fazendo logout...");
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
      setErrors(prev => ({ ...prev, email: "Email é obrigatório" }));
      return;
    }

    if (!validateEmail(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Digite um email válido (exemplo: seu@email.com)",
      }));
      return;
    }

    // Email válido, buscar no servidor
    setIsCheckingEmail(true);
    await checkEmail(email);
    setIsCheckingEmail(false);
    setEmailValidated(true);
  };

  // Preencher campos automaticamente quando cliente for encontrado (verificado ou não)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!clientData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email.trim())) {
      newErrors.email = "Email deve ter um formato válido";
    }

    if (!clientData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!clientData.surname.trim()) {
      newErrors.surname = "Sobrenome é obrigatório";
    }

    if (!clientData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!/^[\d\s\-\(\)\+]+$/.test(clientData.phone.trim())) {
      newErrors.phone = "Telefone deve conter apenas números";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    const newClient = await createClient({
      email: clientData.email.trim(),
      name: clientData.name.trim(),
      surname: clientData.surname.trim(),
      phone: clientData.phone.trim(),
      password: "Senha123!",
    });

    if (!newClient) {
      alert("Erro ao criar conta. Tente novamente.");
      return;
    }

    console.log("✅ Cliente criado com sucesso:", newClient);
    await checkEmail(clientData.email.trim());
  };

  const handleLogin = async () => {
    if (!validateEmail(clientData.email.trim())) {
      setErrors(prev => ({
        ...prev,
        email: "Digite um email válido antes de fazer login",
      }));
      return;
    }

    const codeSent = await sendVerificationCode(clientData.email.trim());

    if (!codeSent) {
      setErrors(prev => ({
        ...prev,
        email: "Erro ao enviar código. Verifique seu email e tente novamente.",
      }));
      return;
    }

    setIsVerifyDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!clientToken) {
      return;
    }

    console.log("🎯 CONFIRMAR AGENDAMENTO - Dados completos:", {
      clientToken,
      clientData: {
        name: clientData.name.trim(),
        surname: clientData.surname.trim(),
        phone: clientData.phone.trim(),
        email: clientData.email.trim(),
        notes: clientData.notes?.trim(),
      },
      selectedSlot: {
        date: selectedSlot.date,
        time: selectedSlot.time,
        branchId: selectedSlot.branchId,
        employeeId: selectedSlot.employeeId,
      },
      service: {
        id: service.id,
        name: service.name,
        price: service.price,
      },
      client: client
        ? {
            id: client.id,
            email: client.email,
            verified: client.verified,
          }
        : null,
    });

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
    console.log("✅ Verificação bem-sucedida! Token:", token);

    // Salvar token no localStorage
    localStorage.setItem("client_token", token);

    // Decodificar token para pegar os dados
    const userData = decodeJWTToken(token);
    console.log("📋 Dados do usuário decodificados:", userData);

    setClientToken(token);
    setIsLoggedIn(true);

    // Fechar o dialog de verificação
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
    return timeStr.slice(0, 5); // Remove os segundos se houver
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Seus dados</h2>
          <p className="text-muted-foreground text-sm">
            Preencha seus dados para finalizar o agendamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de dados do cliente */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {isLoggedIn ? "Seus dados" : "Informações pessoais"}
                </div>
                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Trocar email
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoggedIn ? (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Nome
                        </Label>
                        <p className="font-medium mt-1">{clientData.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Sobrenome
                        </Label>
                        <p className="font-medium mt-1">{clientData.surname}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <p className="font-medium mt-1 break-all">
                        {clientData.email}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Telefone
                      </Label>
                      <p className="font-medium mt-1">
                        {formatPhone(clientData.phone.replace(/^\+55/, ""))}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Alguma observação ou preferência especial..."
                      value={clientData.notes}
                      onChange={e =>
                        setClientData({ ...clientData, notes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                // Modo formulário quando não logado
                <>
                  {/* Campo de Email - Sempre visível */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      Email *
                      {isCheckingEmail && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={clientData.email}
                        onChange={e => {
                          setClientData({
                            ...clientData,
                            email: e.target.value,
                          });
                          setEmailValidated(false);
                          setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleEmailValidation();
                          }
                        }}
                        className={errors.email ? "border-destructive" : ""}
                        disabled={isCheckingEmail}
                      />
                      {!emailValidated && (
                        <Button
                          type="button"
                          onClick={handleEmailValidation}
                          disabled={isCheckingEmail || !clientData.email.trim()}
                          variant="secondary"
                        >
                          {isCheckingEmail ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Verificar"
                          )}
                        </Button>
                      )}
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}

                    {/* Status da verificação */}
                    {emailValidated && !clientError && client && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Email encontrado!
                        </span>
                      </div>
                    )}

                    {emailValidated &&
                      clientError === "Cliente não encontrado" && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">
                            Email disponível para criar conta
                          </span>
                        </div>
                      )}

                    {emailValidated && client && !client.verified && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <p className="font-medium text-yellow-700">
                            Email não verificado
                          </p>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                          Clique em "Fazer login" para verificar seu email e
                          continuar.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Campos restantes - Mostrar apenas após email validado */}
                  {emailValidated && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          placeholder="Digite seu nome"
                          value={clientData.name}
                          onChange={e =>
                            setClientData({
                              ...clientData,
                              name: e.target.value,
                            })
                          }
                          className={errors.name ? "border-destructive" : ""}
                          disabled={
                            client !== null &&
                            clientError !== "Cliente não encontrado"
                          }
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="surname">Sobrenome *</Label>
                        <Input
                          id="surname"
                          placeholder="Digite seu sobrenome"
                          value={clientData.surname}
                          onChange={e =>
                            setClientData({
                              ...clientData,
                              surname: e.target.value,
                            })
                          }
                          className={errors.surname ? "border-destructive" : ""}
                          disabled={
                            client !== null &&
                            clientError !== "Cliente não encontrado"
                          }
                        />
                        {errors.surname && (
                          <p className="text-sm text-destructive">
                            {errors.surname}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={clientData.phone}
                          onChange={e => {
                            const formatted = formatPhone(e.target.value);
                            setClientData({
                              ...clientData,
                              phone: formatted,
                            });
                          }}
                          className={errors.phone ? "border-destructive" : ""}
                          disabled={
                            client !== null &&
                            clientError !== "Cliente não encontrado"
                          }
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações (opcional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Alguma observação ou preferência especial..."
                          value={clientData.notes}
                          onChange={e =>
                            setClientData({
                              ...clientData,
                              notes: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo do agendamento - Apenas Desktop */}
        <div className="hidden lg:block space-y-4">{renderSummaryCard()}</div>
      </div>

      {/* Botão fixo no mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-50">
        {renderActionButton()}
      </div>

      {/* Botão no desktop (dentro do card) - Renderizado dentro do Card no desktop */}

      <ClientVerifyCodeDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        email={clientData.email}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );

  // Função auxiliar para renderizar o card de resumo
  function renderSummaryCard() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo do agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Serviço */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Serviço</p>
            <p className="font-medium">{service.name}</p>
            {service.description && (
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            )}
          </div>

          {/* Data e horário */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Data e horário
            </p>
            <p className="font-medium">{formatDate(selectedSlot.date)}</p>
            <p className="font-medium">{formatTime(selectedSlot.time)}</p>
          </div>

          {/* Profissional */}
          {selectedEmployee && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Profissional
              </p>
              <p className="font-medium">{selectedEmployee.name}</p>
            </div>
          )}

          {/* Local */}
          {selectedBranch && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Local</p>
              <p className="font-medium">{selectedBranch.name}</p>
              {selectedBranch.address && (
                <p className="text-sm text-muted-foreground">
                  {selectedBranch.address}
                </p>
              )}
            </div>
          )}

          {/* Preço */}
          {service.price && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="font-medium">Total</p>
                <p className="font-bold text-lg">
                  R$ {service.price.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Botão no desktop */}
          <div className="pt-4">{renderActionButton()}</div>
        </CardContent>
      </Card>
    );
  }

  // Função auxiliar para renderizar o botão de ação
  function renderActionButton() {
    if (!emailValidated) {
      return (
        <Button
          onClick={handleEmailValidation}
          className="w-full"
          size="lg"
          disabled={isCheckingEmail || !clientData.email.trim()}
        >
          {isCheckingEmail ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando email...
            </>
          ) : (
            "Verificar email"
          )}
        </Button>
      );
    }

    if (!isLoggedIn && clientError === "Cliente não encontrado") {
      return (
        <Button
          onClick={handleCreateAccount}
          className="w-full"
          size="lg"
          style={{ backgroundColor: brandColor }}
          disabled={creatingClient}
        >
          {creatingClient ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      );
    }

    if (!isLoggedIn && !clientToken) {
      return (
        <Button
          onClick={handleLogin}
          className="w-full"
          size="lg"
          style={{ backgroundColor: brandColor }}
          disabled={sendingCode}
        >
          {sendingCode ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando código...
            </>
          ) : (
            "Fazer login"
          )}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
        style={{ backgroundColor: brandColor }}
        disabled={!clientToken}
      >
        Finalizar agendamento
      </Button>
    );
  }
}
