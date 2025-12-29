"use client";

/**
 * EmployeeSelectionStep - Componente de seleção de funcionário adaptado para novo fluxo
 * Filtra funcionários baseado no que já foi selecionado
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Star, Calendar, Clock } from "lucide-react";
import type { EmployeeInfo } from "../types";

interface EmployeeSelectionStepProps {
  employees: EmployeeInfo[];
  selectedDate: string;
  selectedTime: string;
  selectedBranchId?: string | null;
  availableEmployeeIds: string[];
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
              Escolha o profissional
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {selectedBranchId
                ? "Profissionais disponíveis neste local"
                : "Selecione o profissional que deseja"}
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
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold capitalize truncate">
                {formattedDate}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de funcionários */}
      <div className="flex-1 overflow-auto md:overflow-visible space-y-3 pb-20 md:pb-0 pt-3 md:pt-0">
        {availableEmployees.map(employee => (
          <Card
            key={employee.id}
            className="group overflow-hidden border-2 md:border hover:border-primary/50 md:hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97]"
            onClick={() => onEmployeeSelect(employee.id)}
          >
            <CardContent className="p-0 md:p-6">
              {/* Layout Mobile - Card horizontal com foto maior */}
              <div className="flex md:hidden items-center gap-4 p-4">
                {/* Avatar grande */}
                <div className="relative shrink-0">
                  <Avatar className="w-20 h-20 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <AvatarImage
                      src={employee.meta?.design?.images?.profile?.url}
                      alt={`${employee.name} ${employee.surname}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold text-2xl">
                      {employee.name.charAt(0)}
                      {employee.surname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Badge Online */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                    {employee.name} {employee.surname}
                  </h4>
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      5.0
                    </span>
                  </div>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Disponível agora
                  </p>
                </div>
              </div>

              {/* Layout Desktop - Original */}
              <div className="hidden md:flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="w-16 h-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <AvatarImage
                      src={employee.meta?.design?.images?.profile?.url}
                      alt={`${employee.name} ${employee.surname}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                      {employee.name.charAt(0)}
                      {employee.surname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {employee.name} {employee.surname}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Disponível agora
                  </p>

                  {/* Avaliações - Desktop */}
                  <div className="hidden md:flex items-center gap-2 mt-3">
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

                  <div className="hidden md:flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Especialistaaaa
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Experiência comprovada
                    </Badge>
                  </div>
                </div>

                {/* Botão - Desktop */}
                <Button
                  size="lg"
                  className="hidden md:flex ml-auto px-6 md:px-8 group-hover:shadow-md transition-all"
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
