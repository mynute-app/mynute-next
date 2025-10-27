"use client";

/**
 * EmployeeSelectionStep - Componente de seleção de funcionário adaptado para novo fluxo
 * Filtra funcionários baseado no que já foi selecionado
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Star } from "lucide-react";
import type { EmployeeInfo } from "../types";

interface EmployeeSelectionStepProps {
  employees: EmployeeInfo[];
  selectedDate: string;
  selectedTime: string;
  selectedBranchId?: string | null; // Opcional: se vier do fluxo Branch->Employee
  availableEmployeeIds: string[]; // IDs dos funcionários disponíveis para o horário
  onEmployeeSelect: (employeeId: string) => void;
  onBack: () => void;
  brandColor?: string;
}

export function EmployeeSelectionStep({
  employees,
  selectedDate,
  selectedTime,
  selectedBranchId,
  availableEmployeeIds,
  onEmployeeSelect,
  onBack,
  brandColor,
}: EmployeeSelectionStepProps) {
  // Filtrar apenas os funcionários disponíveis
  const availableEmployees = employees.filter(emp =>
    availableEmployeeIds.includes(emp.id)
  );

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
            Escolha o profissional
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedBranchId
              ? "Profissionais disponíveis neste local"
              : "Selecione o profissional que deseja"}
          </p>
        </header>
      </div>

      {/* Informações do agendamento */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data: </span>
              <span className="font-semibold capitalize">{formattedDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Horário: </span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de funcionários */}
      <div className="space-y-3">
        {availableEmployees.map(employee => (
          <Card
            key={employee.id}
            className="group hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
            onClick={() => onEmployeeSelect(employee.id)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <AvatarImage
                      src={employee.design?.images?.profile?.url}
                      alt={`${employee.name} ${employee.surname}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-base sm:text-lg">
                      {employee.name.charAt(0)}
                      {employee.surname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Badge Online */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {employee.name} {employee.surname}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Disponível no horário selecionado
                  </p>

                  {/* Avaliações - Desktop */}
                  <div className="hidden sm:flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      5.0 • Excelente profissional
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Especialista
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Experiência comprovada
                    </Badge>
                  </div>
                </div>

                {/* Botão - Desktop */}
                <Button
                  size="lg"
                  className="hidden sm:flex ml-auto px-6 sm:px-8 group-hover:shadow-md transition-all"
                  style={
                    brandColor ? { backgroundColor: brandColor } : undefined
                  }
                >
                  Escolher
                </Button>

                {/* Botão - Mobile */}
                <Button
                  size="default"
                  className="sm:hidden w-full mt-2"
                  style={
                    brandColor ? { backgroundColor: brandColor } : undefined
                  }
                >
                  Escolher profissional
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Estado vazio */}
        {availableEmployees.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum profissional disponível
              </h3>
              <p className="text-muted-foreground">
                Não há profissionais disponíveis para este horário
                {selectedBranchId && " neste local"}. Tente selecionar outro
                horário{selectedBranchId && " ou local"}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
