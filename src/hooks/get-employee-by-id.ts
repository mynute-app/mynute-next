// hooks/use-get-employee-by-id.ts
import { useEffect, useState } from "react";
import { Employee } from "../../types/company";

export function useGetEmployeeById(id: number | null) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/employee/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar funcionário");
        const data = await res.json();
        setEmployee(data);
      } catch (err) {
        console.error(err);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  return { employee, loading };
}
