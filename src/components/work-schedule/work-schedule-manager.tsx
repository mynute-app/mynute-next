"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, Clock, Calendar, RefreshCw } from "lucide-react";
import { WorkScheduleForm } from "./work-schedule-form";
import { WorkScheduleView } from "./work-schedule-view";
import { Badge } from "@/components/ui/badge";
import {
  useWorkSchedule,
  WorkScheduleRange,
} from "@/hooks/workSchedule/use-work-schedule";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkScheduleManagerProps {
  employeeId: string;
  initialData?: WorkScheduleRange[];
  branches?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function WorkScheduleManager({
  employeeId,
  initialData = [],
  branches = [],
  services = [],
  onSuccess,
}: WorkScheduleManagerProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Hook para gerenciar work schedule com auto fetch
  const {
    workScheduleData,
    fetchWorkSchedule,
    fetchLoading,
    createWorkSchedule,
    loading,
    error,
  } = useWorkSchedule({
    autoFetch: true,
    employeeId,
    onSuccess: () => {
      onSuccess?.();
      setIsEditing(false);
    },
  });

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

  const normalizedBranches = normalizeBranches(branches);
  const normalizedServices = normalizeServices(services);

  const handleSuccess = () => {
    // Dados serão recarregados automaticamente pelo hook
    onSuccess?.();
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    try {
      await fetchWorkSchedule(employeeId);
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Usar dados do hook se disponíveis, senão usar initialData
  const currentData =
    workScheduleData.length > 0 ? workScheduleData : initialData;

  return (
    <div className="w-full space-y-4">
      {/* Header com controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <CardTitle>Jornada de Trabalho</CardTitle>
              {fetchLoading && (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isEditing ? "default" : "secondary"}>
                {isEditing ? "Editando" : "Visualizando"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={fetchLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${fetchLoading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={toggleEditMode}
                className="flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4" />
                    Configurar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo principal */}
      {fetchLoading && !isEditing ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : isEditing ? (
        <WorkScheduleForm
          employeeId={employeeId}
          initialData={currentData}
          branches={normalizedBranches}
          services={normalizedServices}
          onSuccess={handleSuccess}
        />
      ) : (
        <WorkScheduleView
          workRanges={currentData}
          branches={normalizedBranches}
        />
      )}
    </div>
  );
}
