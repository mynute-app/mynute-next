"use client";

/**
 * BranchSelectionStep - Componente de seleção de local adaptado para novo fluxo
 * Filtra locais baseado no que já foi selecionado
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Calendar,
} from "lucide-react";
import type { BranchInfo } from "../types";

interface BranchSelectionStepProps {
  branches: BranchInfo[];
  selectedDate: string;
  selectedTime: string;
  selectedEmployeeId?: string | null; // Opcional: se vier do fluxo Employee->Branch
  onBranchSelect: (branchId: string) => void;
  onBack: () => void;
  brandColor?: string;
}

export function BranchSelectionStep({
  branches,
  selectedDate,
  selectedTime,
  selectedEmployeeId,
  onBranchSelect,
  onBack,
  brandColor,
}: BranchSelectionStepProps) {
  // Formatar data
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(selectedDate + "T00:00:00"));

  return (
    <div className="flex flex-col h-full md:block md:space-y-6">
      {/* Header - Fixo no mobile */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-3 md:pb-0 md:static">
        <div className="flex items-center gap-3 mb-3 md:mb-0">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <header className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight">
              Escolha o local
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {selectedEmployeeId
                ? "Locais onde o profissional atende"
                : "Selecione onde você gostaria de ser atendido"}
            </p>
          </header>
        </div>

        {/* Info compacta - Mobile */}
        <div className="flex md:hidden items-center gap-3 text-xs bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium capitalize">
              {formattedDate.split(",")[0]}
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">{selectedTime}</span>
          </div>
        </div>
      </div>

      {/* Informações do agendamento - Desktop */}
      <Card className="hidden md:block border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-semibold capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de locais */}
      <div className="flex-1 overflow-auto md:overflow-visible space-y-3 md:space-y-4 pb-20 md:pb-0 pt-3 md:pt-0">
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Locais disponíveis</h3>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {branches.length}
          </Badge>
        </div>

        <div className="grid gap-3 md:gap-4">
          {branches.map(branch => (
            <Card
              key={branch.id}
              className="group overflow-hidden border-2 md:border hover:border-primary/50 md:hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.97] md:hover:scale-[1.01]"
              onClick={() => onBranchSelect(branch.id)}
            >
              {/* Layout Mobile - Vertical */}
              <CardContent className="p-0 md:p-6">
                {/* Mobile */}
                <div className="flex md:hidden flex-col">
                  {/* Imagem grande no topo */}
                  <div className="relative w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                    {branch.design?.images?.profile?.url ? (
                      <img
                        src={branch.design.images.profile.url}
                        alt={branch.design.images.profile.alt || branch.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MapPin className="w-12 h-12 text-primary/40" />
                    )}
                    {/* Badge disponível */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      Disponível
                    </div>
                  </div>

                  {/* Info embaixo */}
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {branch.name}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>
                        {branch.street}, {branch.number} • {branch.neighborhood}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Desktop - Layout horizontal original mas melhorado */}
                <div className="hidden md:flex items-center gap-6">
                  {/* Imagem do local */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 group-hover:border-primary/40 transition-colors flex items-center justify-center overflow-hidden">
                      {branch.design?.images?.profile?.url ? (
                        <img
                          src={branch.design.images.profile.url}
                          alt={branch.design.images.profile.alt || branch.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MapPin className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {branch.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {branch.street}, {branch.number}
                      {branch.complement && ` - ${branch.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {branch.neighborhood}, {branch.city} - {branch.state}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CEP: {branch.zip_code}
                    </p>

                    {/* Ações - Desktop */}
                    <div className="hidden md:flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                        <Navigation className="w-4 h-4" />
                        Ver no mapa
                      </button>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>(11) 9999-9999</span>
                      </div>
                    </div>

                    {/* Badges - Desktop */}
                    <div className="hidden md:flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Estacionamento
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Acessível
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Wi-Fi gratuito
                      </Badge>
                    </div>
                  </div>

                  {/* Botão - Desktop */}
                  <Button
                    size="lg"
                    className="hidden md:flex ml-auto px-8 group-hover:shadow-md transition-all self-center"
                    style={
                      brandColor ? { backgroundColor: brandColor } : undefined
                    }
                  >
                    Escolher
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estado vazio */}
        {branches.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum local disponível
              </h3>
              <div className="text-muted-foreground">
                Não há locais disponíveis
                {selectedEmployeeId &&
                  " onde este profissional atende no horário selecionado"}
                .
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
