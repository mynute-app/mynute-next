"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "../../../../../types/company";

interface BranchEmployeesProps {
  employees?: Employee[];
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map(emp => (
          <Card key={emp.id} className="p-4">
            <h4 className="font-semibold">
              {emp.name} {emp.surname}
            </h4>
            <p className="text-sm text-muted-foreground">{emp.email}</p>
            <p className="text-sm">{emp.phone}</p>
            {emp.role && <p className="text-sm italic mt-1">{emp.role}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
