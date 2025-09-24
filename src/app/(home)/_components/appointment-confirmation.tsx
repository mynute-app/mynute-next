"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import type { Service } from "../../../../types/company";
import type { ClientData } from "./client-details-form";

interface AppointmentConfirmationProps {
  service: Service;
  selectedSlot: {
    date: string;
    time: string;
    branchId: string;
    employeeId: string;
  };
  clientData: ClientData;
  branches: any[];
  employees: any[];
  brandColor?: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function AppointmentConfirmation({
  service,
  selectedSlot,
  clientData,
  branches,
  employees,
  brandColor,
  onConfirm,
  onBack,
}: AppointmentConfirmationProps) {
  const selectedEmployee = employees.find(
    (emp: any) => emp.id === selectedSlot.employeeId
  );
  const selectedBranch = branches.find(
    (branch: any) => branch.id === selectedSlot.branchId
  );

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

  const formatPhone = (phone: string) => {
    // Formatação simples do telefone
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Header de sucesso */}
      <div className="text-center space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: brandColor + "20" }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: brandColor }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Confirmar agendamento</h2>
          <p className="text-muted-foreground">
            Revise todas as informações antes de finalizar
          </p>
        </div>
      </div>

      {/* Cards de informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados do cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Seus dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{clientData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatPhone(clientData.phone)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{clientData.email}</p>
                </div>
              </div>

              {clientData.notes && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Observações:
                    </p>
                    <p className="font-medium">{clientData.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Detalhes do agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Serviço */}
              <div>
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

              <Separator />

              {/* Data e horário */}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(selectedSlot.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatTime(selectedSlot.time)}</p>
                </div>
              </div>

              {/* Profissional */}
              {selectedEmployee && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Profissional
                    </p>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                </div>
              )}

              {/* Local */}
              {selectedBranch && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{selectedBranch.name}</p>
                    {selectedBranch.address && (
                      <p className="text-sm text-muted-foreground">
                        {selectedBranch.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Preço */}
              {service.price && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Valor total</p>
                    <p className="font-bold text-lg">
                      R$ {service.price.toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar e editar
        </Button>
        <Button
          onClick={onConfirm}
          size="lg"
          className="sm:min-w-[200px]"
          style={{ backgroundColor: brandColor }}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar agendamento
        </Button>
      </div>
    </div>
  );
}
