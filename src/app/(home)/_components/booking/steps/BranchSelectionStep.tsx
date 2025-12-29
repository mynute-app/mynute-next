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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Escolha o local
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedEmployeeId
              ? "Locais onde o profissional atende"
              : "Selecione onde você gostaria de ser atendido"}
          </p>
        </header>
      </div>

      {/* Informações do agendamento */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Data: </span>
              <span className="font-semibold capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Horário: </span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de locais */}
      <div className="space-y-4 pb-6 md:pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Locais disponíveis</h3>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {branches.length} {branches.length === 1 ? "local" : "locais"}
          </Badge>
        </div>

        <div className="grid gap-4">
          {branches.map(branch => (
            <Card
              key={branch.id}
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
              onClick={() => onBranchSelect(branch.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Imagem do local */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 group-hover:border-primary/40 transition-colors flex items-center justify-center overflow-hidden">
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
                    {/* Badge Online */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
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
                    <div className="hidden sm:flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                        <Navigation className="w-4 h-4" />
                        Ver no mapa
                      </button>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>(11) 9999-9999</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
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
                    className="hidden sm:flex ml-auto px-8 group-hover:shadow-md transition-all self-center"
                    style={
                      brandColor ? { backgroundColor: brandColor } : undefined
                    }
                  >
                    Escolher
                  </Button>

                  {/* Botão - Mobile */}
                  <Button
                    size="default"
                    className="sm:hidden w-full"
                    style={
                      brandColor ? { backgroundColor: brandColor } : undefined
                    }
                  >
                    Escolher local
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
              <p className="text-muted-foreground">
                Não há locais disponíveis
                {selectedEmployeeId &&
                  " onde este profissional atende no horário selecionado"}
                .
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
