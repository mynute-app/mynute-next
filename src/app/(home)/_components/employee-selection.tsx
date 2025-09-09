"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, Star, MapPin, User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  surname: string;
  design?: {
    images?: {
      profile?: {
        url: string;
        alt: string;
      };
    };
  };
}

interface SelectedTimeSlot {
  date: string;
  time: string;
  branchId: string;
  availableEmployees: string[];
}

interface EmployeeSelectionProps {
  selectedTimeSlot: SelectedTimeSlot;
  employees: Employee[];
  branches: any[];
  brandColor?: string;
  onEmployeeSelect: (employeeId: string) => void;
  onBack: () => void;
}

export function EmployeeSelection({
  selectedTimeSlot,
  employees,
  branches,
  brandColor,
  onEmployeeSelect,
  onBack,
}: EmployeeSelectionProps) {
  // Filtrar apenas os funcionários disponíveis para este horário
  const availableEmployees = employees.filter(emp =>
    selectedTimeSlot.availableEmployees.includes(emp.id)
  );

  // Buscar informações da filial
  const branch = branches.find(b => b.id === selectedTimeSlot.branchId);

  // Formatar data
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(selectedTimeSlot.date + "T00:00:00"));

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
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Escolha seu profissional
          </h2>
          <p className="text-muted-foreground mt-1">
            Selecione o profissional que realizará seu atendimento
          </p>
        </div>
      </div>

      {/* Informações do horário selecionado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horário selecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{selectedTimeSlot.time}</span>
            </div>
            {branch && (
              <div className="text-muted-foreground">• {branch.name}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de funcionários disponíveis */}
      <div className="space-y-4">
        <h3 className="font-medium">
          Profissionais disponíveis ({availableEmployees.length})
        </h3>

        <div className="grid gap-4">
          {availableEmployees.map(employee => (
            <Card
              key={employee.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onEmployeeSelect(employee.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={employee.design?.images?.profile?.url}
                      alt={
                        employee.design?.images?.profile?.alt ||
                        `${employee.name} ${employee.surname}`
                      }
                    />
                    <AvatarFallback>
                      {employee.name.charAt(0)}
                      {employee.surname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-medium">
                      {employee.name} {employee.surname}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Disponível às {selectedTimeSlot.time}
                    </p>
                  </div>

                  <Button
                    style={
                      brandColor ? { backgroundColor: brandColor } : undefined
                    }
                    className="ml-auto"
                  >
                    Escolher
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {availableEmployees.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Nenhum profissional disponível para este horário.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
