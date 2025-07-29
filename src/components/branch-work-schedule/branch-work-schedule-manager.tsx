"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Eye, Clock, Building2 } from "lucide-react";
import { BranchWorkScheduleView } from "./branch-work-schedule-view";
import { BranchWorkScheduleForm } from "./branch-work-schedule-form";

interface BranchWorkScheduleRange {
  branch_id: string;
  end_time: string;
  services: object[];
  start_time: string;
  time_zone: string;
  weekday: number;
}

interface BranchWorkScheduleManagerProps {
  branchId: string;
  branchName?: string;
  initialData?: BranchWorkScheduleRange[];
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  defaultView?: "view" | "edit";
}

export function BranchWorkScheduleManager({
  branchId,
  branchName = "Filial",
  initialData = [],
  services = [],
  onSuccess,
  defaultView = "view",
}: BranchWorkScheduleManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultView);

  // Função para normalizar os dados vindos do backend
  const normalizeInitialData = (data: any[]): BranchWorkScheduleRange[] => {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      branch_id: String(item.branch_id || branchId),
      end_time: String(item.end_time || item.end || "17:00"),
      start_time: String(item.start_time || item.start || "09:00"),
      time_zone: String(item.time_zone || "America/Sao_Paulo"),
      weekday: Number(item.weekday || 1),
      services: Array.isArray(item.services) ? item.services : [],
    }));
  };

  // Função para normalizar services
  const normalizeServices = (servicesData: any[]) => {
    if (!Array.isArray(servicesData)) return [];

    return servicesData.map(service => ({
      id: String(service.id || ""),
      name: String(service.name || "Serviço"),
    }));
  };

  const [workScheduleData, setWorkScheduleData] = useState<
    BranchWorkScheduleRange[]
  >(normalizeInitialData(initialData));

  const normalizedServices = normalizeServices(services);

  const handleSuccess = () => {
    setActiveTab("view");
    onSuccess?.();
  };

  const hasWorkSchedule = workScheduleData.length > 0;

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <h3 className="text-lg font-medium">
              Horários da Filial - {branchName}
            </h3>
          </div>

          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="view" className="mt-4">
          {hasWorkSchedule ? (
            <BranchWorkScheduleView
              workRanges={workScheduleData}
              branchName={branchName}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum horário configurado
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Configure os horários de funcionamento desta filial para que
                  os funcionários possam trabalhar aqui.
                </p>
                <Button
                  onClick={() => setActiveTab("edit")}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configurar Horários
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <BranchWorkScheduleForm
            branchId={branchId}
            branchName={branchName}
            initialData={workScheduleData}
            services={normalizedServices}
            onSuccess={handleSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
