"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Eye } from "lucide-react";
import { WorkScheduleForm } from "./work-schedule-form";
import { WorkScheduleView } from "./work-schedule-view";

interface WorkScheduleRange {
  branch_id: string;
  employee_id: string;
  end_time: string;
  services: object[];
  start_time: string;
  time_zone: string;
  weekday: number;
}

interface WorkScheduleManagerProps {
  employeeId: string;
  initialData?: WorkScheduleRange[];
  branches?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  defaultView?: "view" | "edit";
}

export function WorkScheduleManager({
  employeeId,
  initialData = [],
  branches = [],
  services = [],
  onSuccess,
  defaultView = "view",
}: WorkScheduleManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultView);

  // Função para normalizar os dados vindos do backend
  const normalizeInitialData = (data: any[]): WorkScheduleRange[] => {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      branch_id: String(item.branch_id || ""),
      employee_id: String(item.employee_id || employeeId),
      end_time: String(item.end_time || item.end || "17:00"),
      start_time: String(item.start_time || item.start || "09:00"),
      time_zone: String(item.time_zone || "America/Sao_Paulo"),
      weekday: Number(item.weekday || 1),
      services: Array.isArray(item.services) ? item.services : [],
    }));
  };

  // Função para normalizar branches
  const normalizeBranches = (branchesData: any[]) => {
    if (!Array.isArray(branchesData)) return [];

    return branchesData.map(branch => ({
      id: String(branch.id || ""),
      name: String(branch.name || "Filial"),
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

  const [workScheduleData, setWorkScheduleData] = useState<WorkScheduleRange[]>(
    normalizeInitialData(initialData)
  );

  const normalizedBranches = normalizeBranches(branches);
  const normalizedServices = normalizeServices(services);

  const handleSuccess = () => {
    // Aqui você pode adicionar lógica para recarregar os dados
    // ou fazer outras ações após o sucesso
    onSuccess?.();
    setActiveTab("view"); // Volta para a visualização após salvar
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visualizar
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-4">
          <WorkScheduleView
            workRanges={workScheduleData}
            branches={normalizedBranches}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <WorkScheduleForm
            employeeId={employeeId}
            initialData={workScheduleData}
            branches={normalizedBranches}
            services={normalizedServices}
            onSuccess={handleSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
