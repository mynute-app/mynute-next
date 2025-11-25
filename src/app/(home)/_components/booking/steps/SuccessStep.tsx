"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Copy,
  Share2,
  Check,
  Calendar,
  Clock,
  MapPin,
  User,
  Briefcase,
} from "lucide-react";
import type { Service } from "../../../../../../types/company";
import type { BranchInfo, EmployeeInfo, ClientData } from "../types";

interface SuccessStepProps {
  brandColor?: string;
  onComplete: () => void;
  service: Service;
  selectedSlot: {
    date: string;
    time: string;
    branchId: string;
    employeeId: string;
  };
  clientData: ClientData;
  branches: BranchInfo[];
  employees: EmployeeInfo[];
}

export function SuccessStep({
  brandColor,
  onComplete,
  service,
  selectedSlot,
  clientData,
  branches,
  employees,
}: SuccessStepProps) {
  const [copied, setCopied] = useState(false);

  // Buscar informações
  const branch = branches.find(b => b.id === selectedSlot.branchId);
  const employee = employees.find(e => e.id === selectedSlot.employeeId);

  // Formatar data
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(selectedSlot.date + "T00:00:00"));

  // Texto do comprovante
  const appointmentText = `
🎉 AGENDAMENTO CONFIRMADO

📅 Data: ${formattedDate}
⏰ Horário: ${selectedSlot.time}

💼 Serviço: ${service.name}
${service.duration ? `⏱️ Duração: ${service.duration} minutos` : ""}
${service.price ? `💰 Valor: R$ ${service.price.toFixed(2)}` : ""}

👤 Cliente: ${clientData.name} ${clientData.surname}
📧 E-mail: ${clientData.email}
📱 Telefone: ${clientData.phone}

👨‍💼 Profissional: ${employee?.name} ${employee?.surname || ""}

📍 Local: ${branch?.name}
${branch?.street}, ${branch?.number}${
    branch?.complement ? ` - ${branch?.complement}` : ""
  }
${branch?.neighborhood} - ${branch?.city}/${branch?.state}
  `.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appointmentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Comprovante de Agendamento",
          text: appointmentText,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback: copiar
      handleCopy();
    }
  };

  return (
    <div className="flex items-center justify-center py-8">
      <Card className="max-w-2xl w-full border-2 border-green-500/20">
        <CardContent className="p-8 space-y-6">
          {/* Ícone animado */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{
                  backgroundColor: brandColor || "rgb(34, 197, 94)",
                }}
              />
              <div
                className="relative rounded-full p-4 animate-scale-in"
                style={{
                  backgroundColor: brandColor
                    ? `${brandColor}15`
                    : "rgb(34, 197, 94, 0.1)",
                }}
              >
                <CheckCircle2
                  className="w-16 h-16"
                  style={{ color: brandColor || "rgb(34, 197, 94)" }}
                />
              </div>
            </div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-green-600">
              Agendamento Confirmado!
            </h2>
            <p className="text-muted-foreground">
              Enviamos uma confirmação para o seu e-mail.
            </p>
          </div>

          <Separator />

          {/* Informações do agendamento */}
          <div className="space-y-4">
            {/* Data e Hora */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium capitalize">{formattedDate}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {selectedSlot.time}
                  {service.duration && ` (${service.duration} min)`}
                </p>
              </div>
            </div>

            {/* Serviço */}
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{service.name}</p>
                {service.price && (
                  <p className="text-sm text-muted-foreground">
                    R$ {service.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Profissional */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {employee?.name} {employee?.surname || ""}
                </p>
                <p className="text-sm text-muted-foreground">Profissional</p>
              </div>
            </div>

            {/* Local */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{branch?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {branch?.street}, {branch?.number}
                  {branch?.complement && ` - ${branch?.complement}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {branch?.neighborhood} - {branch?.city}/{branch?.state}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>

          {/* Botão principal */}
          <Button
            onClick={onComplete}
            className="w-full"
            size="lg"
            style={{
              backgroundColor: brandColor || "rgb(34, 197, 94)",
            }}
          >
            Fazer novo agendamento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
