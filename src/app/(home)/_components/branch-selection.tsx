"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  User,
  Navigation,
  Phone,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  design?: {
    images?: {
      profile?: {
        url: string;
        alt: string;
      };
    };
  };
}

interface Employee {
  id: string;
  name: string;
  surname: string;
}

interface SelectedAppointment {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

interface BranchSelectionProps {
  selectedAppointment: SelectedAppointment;
  branches: Branch[];
  employees: Employee[];
  brandColor?: string;
  onBranchSelect: (branchId: string) => void;
  onBack: () => void;
}

export function BranchSelection({
  selectedAppointment,
  branches,
  employees,
  brandColor,
  onBranchSelect,
  onBack,
}: BranchSelectionProps) {
  // Buscar informações do funcionário
  const employee = employees.find(
    emp => emp.id === selectedAppointment.employeeId
  );

  // Formatar data
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(selectedAppointment.date + "T00:00:00"));

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
        <header className="">
          <h1 className="text-2xl font-semibold tracking-tight">
            {" "}
            Escolha o local
          </h1>
          <p className="text-sm text-muted-foreground">
            Selecione onde você gostaria de ser atendido
          </p>
        </header>
      </div>

      {/* Informações do agendamento */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-semibold capitalize">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-semibold">{selectedAppointment.time}</p>
                </div>
              </div>

              {employee && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Profissional
                    </p>
                    <p className="font-semibold">
                      {employee.name} {employee.surname}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Badge variant="secondary" className="px-3 py-1">
              {branches.length} {branches.length === 1 ? "local" : "locais"}{" "}
              disponível
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de locais disponíveis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Locais disponíveis</h3>
        </div>

        <div className="grid gap-4">
          {branches.map(branch => (
            <Card
              key={branch.id}
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              onClick={() => onBranchSelect(branch.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Imagem do local */}
                  <div className="relative">
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

                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {branch.name}
                    </h4>
                    <p className="text-muted-foreground mt-1">
                      {branch.street}, {branch.number}
                      {branch.complement && ` - ${branch.complement}`}
                    </p>
                    <p className="text-muted-foreground">
                      {branch.neighborhood}, {branch.city} - {branch.state}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      CEP: {branch.zip_code}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary font-medium hover:underline">
                          Ver no mapa
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          (11) 9999-9999
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
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

                  <Button
                    size="lg"
                    className="ml-auto px-8 group-hover:shadow-md transition-all"
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
                Não há locais disponíveis para este agendamento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
