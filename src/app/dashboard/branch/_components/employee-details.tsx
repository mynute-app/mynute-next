// components/branch-manager/employee-details.tsx
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: number;
  name: string;
  surname: string;
  role?: string;
  email: string;
  phone: string;
  tags?: string[] | null;
}

interface EmployeeDetailsProps {
  employee: Employee;
  onBack: () => void;
}

export function EmployeeDetails({ employee, onBack }: EmployeeDetailsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Detalhes de {employee.name} {employee.surname}
        </h2>
       
      </div>

      <div className="space-y-2">
        <p>
          <strong>Email:</strong> {employee.email}
        </p>
        <p>
          <strong>Telefone:</strong> {employee.phone}
        </p>
        {employee.role && (
          <p>
            <strong>Cargo:</strong> {employee.role}
          </p>
        )}
        {employee.tags && (
          <p>
            <strong>Tags:</strong> {employee.tags.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
