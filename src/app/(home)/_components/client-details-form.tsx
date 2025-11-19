"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import { useClientByEmail } from "@/hooks/use-client-by-email";
import { useCreateClient } from "@/hooks/use-create-client";
import { useClientSendLoginCode } from "@/hooks/use-client-send-login-code";
import type { Service } from "../../../../types/company";
import { ClientVerifyCodeDialog } from "./client-verify-code-dialog";
import { UnverifiedEmailAlert } from "./unverified-email-alert";

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

  const handleEmailBlur = async () => {
    const email = clientData.email.trim();

    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    await checkEmail(email);
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Se já tem token, pode prosseguir para agendamento
    if (clientToken) {
      onSubmit({
        ...clientData,
        name: clientData.name.trim(),
        surname: clientData.surname.trim(),
        phone: clientData.phone.trim(),
        email: clientData.email.trim(),
        notes: clientData.notes?.trim(),
      });
      return;
    }

    // Cenário: Cliente existe e está verificado - enviar código para fazer login
    if (client && client.verified) {
      const codeSent = await sendVerificationCode(clientData.email.trim());

      if (!codeSent) {
        alert("Erro ao enviar código de verificação. Tente novamente.");
        return;
      }

      // Abrir dialog de verificação
      setIsVerifyDialogOpen(true);
      return;
    }
  };

  const handleVerificationSuccess = (token: string) => {
    console.log("✅ Verificação bem-sucedida! Token:", token);
    setClientToken(token);

    // Continuar com o agendamento
    onSubmit({
      ...clientData,
      name: clientData.name.trim(),
      surname: clientData.surname.trim(),
      phone: clientData.phone.trim(),
      email: clientData.email.trim(),
      notes: clientData.notes?.trim(),
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Seus dados</h2>
          <p className="text-muted-foreground">
            Preencha seus dados para finalizar o agendamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de dados do cliente */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  Email *
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={clientData.email}
                  onChange={e =>
                    setClientData({ ...clientData, email: e.target.value })
                  }
                  onBlur={handleEmailBlur}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}

                {/* DEBUG: Mostrar resultado da busca */}
                {loading && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="font-medium">🔍 Buscando cliente...</p>
                  </div>
                )}

                {!loading && clientError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="font-medium text-red-700">❌ {clientError}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Uma conta será criada e você receberá um código de
                      verificação por email.
                    </p>
                  </div>
                )}

                {!loading && client && !client.verified && (
                  <UnverifiedEmailAlert
                    email={clientData.email}
                    onVerificationSuccess={token => {
                      setClientToken(token);
                    }}
                  />
                )}

                {!loading && client && client.verified && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                    <p className="font-medium text-green-700">
                      ✅ Cliente encontrado
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Seus dados foram preenchidos automaticamente. Você
                      receberá um código por email para fazer login.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={clientData.name}
                  onChange={e =>
                    setClientData({ ...clientData, name: e.target.value })
                  }
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname">Sobrenome *</Label>
                <Input
                  id="surname"
                  placeholder="Digite seu sobrenome"
                  value={clientData.surname}
                  onChange={e =>
                    setClientData({ ...clientData, surname: e.target.value })
                  }
                  className={errors.surname ? "border-destructive" : ""}
                />
                {errors.surname && (
                  <p className="text-sm text-destructive">{errors.surname}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={clientData.phone}
                  onChange={e =>
                    setClientData({ ...clientData, phone: e.target.value })
                  }
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
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
            </CardContent>
          </Card>
        </div>

        {/* Resumo do agendamento */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Serviço */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Serviço
                </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Local
                  </p>
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
            </CardContent>
          </Card>

          {/* Botão de confirmação */}
          <Button
            onClick={
              clientError === "Cliente não encontrado"
                ? handleCreateAccount
                : handleSubmit
            }
            className="w-full"
            size="lg"
            style={{ backgroundColor: brandColor }}
            disabled={
              creatingClient ||
              sendingCode ||
              !!(client && !client.verified && !clientToken)
            }
          >
            {creatingClient ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : sendingCode ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando código...
              </>
            ) : clientError === "Cliente não encontrado" ? (
              "Criar conta"
            ) : (
              "Finalizar agendamento"
            )}
          </Button>
        </div>
      </div>

      <ClientVerifyCodeDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        email={clientData.email}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
