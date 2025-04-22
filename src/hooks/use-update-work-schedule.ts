import { useState } from "react";

export const useUpdateWorkSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorkSchedule = async ({
    employeeId,
    workSchedule,
  }: {
    employeeId: number;
    workSchedule: {
      [key: string]: { start: string; end: string; branch_id: number }[];
    };
  }) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch(`/api/work_schedule/${employeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ work_schedule: workSchedule }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar horários");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { updateWorkSchedule, loading, success, error };
};
