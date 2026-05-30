"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Info,
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

  const branch = branches.find(b => b.id === selectedSlot.branchId);
  const employee = employees.find(e => e.id === selectedSlot.employeeId);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(selectedSlot.date + "T00:00:00"));

  const appointmentText = `
�x9 SOLICITAÇÃO DE AGENDAMENTO RECEBIDA

�x& Data: ${formattedDate}
� Horário: ${selectedSlot.time}

�x� Serviço: ${service.name}
${service.duration ? `� Duração: ${service.duration} minutos` : ""}
${service.price ? `�x� Valor: R$ ${service.price.toFixed(2)}` : ""}

�x� Cliente: ${clientData.name} ${clientData.surname}
�x� E-mail: ${clientData.email}
�x� Telefone: ${clientData.phone}

�x�
�x� Profissional: ${employee?.name} ${employee?.surname || ""}

�x� Local: ${branch?.name}
${branch?.street}, ${branch?.number}${branch?.complement ? ` - ${branch?.complement}` : ""}
${branch?.neighborhood} - ${branch?.city}/${branch?.state}

�� Sua solicitação será analisada e Você receberá uma confirmação por e-mail.
  `.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appointmentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // ignored
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Comprovante de Agendamento",
          text: appointmentText,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const accent = brandColor || "hsl(var(--primary))";

  return (
    <div className="flex items-center justify-center py-6">
      <div className="max-w-lg w-full space-y-5">
        {/* Header de sucesso */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center gap-4 shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)]">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: accent }}
            />
            <div
              className="relative rounded-full p-4"
              style={{
                backgroundColor: `${brandColor ? brandColor : "hsl(var(--primary))"}18`,
              }}
            >
              <CheckCircle2 className="w-14 h-14" style={{ color: accent }} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Solicitação Recebida!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sua solicitação foi enviada e aguarda confirmação.
            </p>
          </div>

          {/* Aviso pendente */}
          <div
            className="w-full flex items-start gap-3 rounded-lg p-3 text-left"
            style={{
              backgroundColor: brandColor
                ? `${brandColor}10`
                : "hsl(var(--muted))",
              border: `1px solid ${brandColor ? `${brandColor}25` : "hsl(var(--border))"}`,
            }}
          >
            <Info
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: accent }}
            />
            <p className="text-xs" style={{ color: accent }}>
              Você receberá um <strong>e-mail de confirmação</strong> assim que
              o profissional aprovar o agendamento.
            </p>
          </div>
        </div>

        {/* Detalhes do agendamento */}
        <div className="rounded-xl border border-border bg-card shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] divide-y divide-border">
          {[
            {
              icon: Calendar,
              label: "Data e Horário",
              value: `${formattedDate} às ${selectedSlot.time}${service.duration ? ` (${service.duration} min)` : ""}`,
            },
            {
              icon: Briefcase,
              label: "Serviço",
              value: service.name,
              sub: service.price ? `R$ ${service.price.toFixed(2)}` : undefined,
            },
            {
              icon: User,
              label: "Profissional",
              value:
                `${employee?.name ?? ""} ${employee?.surname ?? ""}`.trim() ||
                "–",
            },
            {
              icon: MapPin,
              label: "Local",
              value: branch?.name ?? "–",
              sub: branch
                ? `${branch.street}, ${branch.number}${branch.complement ? ` – ${branch.complement}` : ""} – ${branch.neighborhood}`
                : undefined,
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground capitalize leading-snug">
                  {value}
                </p>
                {sub && (
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="gap-2 rounded-lg"
          >
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
          <Button
            variant="outline"
            onClick={handleShare}
            className="gap-2 rounded-lg"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>

        <Button
          onClick={onComplete}
          className="w-full rounded-lg h-11 font-semibold"
          style={{
            backgroundColor: accent,
            color: "#fff",
            borderColor: accent,
          }}
        >
          Fazer novo agendamento
        </Button>
      </div>
    </div>
  );
}
