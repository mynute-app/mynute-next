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
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <header className="">
          <h1 className="text-2xl font-semibold tracking-tight">
            {" "}
            Escolha seu profissional
          </h1>
          <p className="text-sm text-muted-foreground">
            Selecione o profissional que realizará seu atendimento
          </p>
        </header>
      </div>

      {/* Lista de funcionários disponíveis */}
      <div className="space-y-4">
        <div className="grid gap-4">
          {availableEmployees.map(employee => (
            <Card
              key={employee.id}
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              onClick={() => onEmployeeSelect(employee.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                      <AvatarImage
                        src={employee.design?.images?.profile?.url}
                        alt={
                          employee.design?.images?.profile?.alt ||
                          `${employee.name} ${employee.surname}`
                        }
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                        {employee.name.charAt(0)}
                        {employee.surname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {employee.name} {employee.surname}
                    </h4>
                    <p className="text-muted-foreground mt-1">
                      Disponível às {selectedTimeSlot.time}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        5.0 • 127 avaliações
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Especialista
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +3 anos exp.
                      </Badge>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="ml-auto px-8 group-hover:shadow-md transition-all"
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
        </div>

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
                Não há profissionais disponíveis para este horário. Tente
                selecionar outro horário.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
