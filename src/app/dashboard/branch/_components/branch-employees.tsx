"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Employee } from "../../../../../types/company";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Mail, Phone, Briefcase, User } from "lucide-react";

interface BranchEmployeesProps {
  employees?: any[]; // Aceita qualquer tipo de employee da API
}

export function BranchEmployees({ employees }: BranchEmployeesProps) {
  if (!employees || employees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum funcionário cadastrado nesta filial.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Funcionários</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {employees.map(emp => (
          <Card
            key={emp.id}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={emp.name}
                  surname={emp.surname}
                  imageUrl={emp.meta?.design?.images?.profile?.url}
                  size="sm"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {emp.name} {emp.surname}
                  </h4>
                  {emp.role && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">
                        {emp.role}
                      </p>
                    </div>
                  )}
                  {emp.total_service_density !== undefined && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {emp.total_service_density} serviço
                        {emp.total_service_density !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {(emp.email || emp.phone) && (
                <div className="mt-3 space-y-1.5">
                  {emp.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">
                        {emp.email}
                      </p>
                    </div>
                  )}
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {emp.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
