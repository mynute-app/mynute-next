"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User } from "lucide-react";
import type {
  BranchInfo,
  EmployeeInfo,
} from "@/hooks/service/useServiceAvailability";

interface FilterSidebarProps {
  branches: BranchInfo[];
  employees: EmployeeInfo[];
  selectedBranch: string | null;
  selectedEmployee: string | null;
  brandColor?: string;
  onBranchSelect: (branchId: string | null) => void;
  onEmployeeSelect: (employeeId: string | null) => void;
}

export function FilterSidebar({
  branches,
  employees,
  selectedBranch,
  selectedEmployee,
  brandColor,
  onBranchSelect,
  onEmployeeSelect,
}: FilterSidebarProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Filtros</h3>

      {/* Seleção de Filial */}
      {branches.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Local</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={!selectedBranch ? "default" : "outline"}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => onBranchSelect(null)}
            >
              Todos os locais
            </Button>
            {branches.map(branch => (
              <Button
                key={branch.id}
                variant={selectedBranch === branch.id ? "default" : "outline"}
                size="sm"
                className="w-full justify-start text-xs"
                style={
                  selectedBranch === branch.id && brandColor
                    ? {
                        backgroundColor: brandColor,
                        borderColor: brandColor,
                      }
                    : undefined
                }
                onClick={() => onBranchSelect(branch.id)}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {branch.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Seleção de Funcionário */}
      {employees.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Profissional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={!selectedEmployee ? "default" : "outline"}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => onEmployeeSelect(null)}
            >
              Qualquer profissional
            </Button>
            {employees.map(employee => (
              <Button
                key={employee.id}
                variant={
                  selectedEmployee === employee.id ? "default" : "outline"
                }
                size="sm"
                className="w-full justify-start text-xs"
                style={
                  selectedEmployee === employee.id && brandColor
                    ? {
                        backgroundColor: brandColor,
                        borderColor: brandColor,
                      }
                    : undefined
                }
                onClick={() => onEmployeeSelect(employee.id)}
              >
                <User className="w-3 h-3 mr-1" />
                {employee.name} {employee.surname}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
