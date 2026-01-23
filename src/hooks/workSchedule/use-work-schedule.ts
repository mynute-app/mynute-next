import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface WorkScheduleRange {
  id?: string;
  employee_id: string;
  branch_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  time_zone: string;
  services: Array<{ id?: string; [key: string]: any }>;
}

export interface WorkSchedulePayload {
  employee_work_ranges: WorkScheduleRange[];
}

interface UseWorkScheduleProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const extractTime = (value?: string) => {
  if (!value) return "";

  try {
    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    if (value.includes("T") || value.includes("-") || value.length > 8) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 5);
      }
    }

    if (value.includes(":")) {
      const match = value.match(/(\d{1,2}:\d{2})/);
      if (match) {
        return match[1].padStart(5, "0");
      }
    }

    return "";
  } catch {
    return "";
  }
};

const normalizeWorkScheduleRanges = (
  raw: any,
  employeeId?: string
): WorkScheduleRange[] => {
  const ranges =
    raw?.employee_work_ranges ||
    raw?.work_schedule?.employee_work_ranges ||
    raw?.data ||
    raw ||
    [];

  if (!Array.isArray(ranges)) return [];

  return ranges.map((range: any) => ({
    id: range?.id ? String(range.id) : undefined,
    employee_id: String(range?.employee_id || employeeId || ""),
    branch_id: String(range?.branch_id || ""),
    weekday: Number(range?.weekday ?? 1),
    start_time: extractTime(range?.start_time || range?.start),
    end_time: extractTime(range?.end_time || range?.end),
    time_zone: String(range?.time_zone || "America/Sao_Paulo"),
    services: Array.isArray(range?.services) ? range.services : [],
  }));
};

const normalizeForPayload = (
  ranges: WorkScheduleRange[],
  employeeId: string
): WorkScheduleRange[] => {
  return ranges.map(range => ({
    id: range.id,
    employee_id: range.employee_id || employeeId,
    branch_id: range.branch_id || "",
    weekday: Number(range.weekday ?? 1),
    start_time: range.start_time || "",
    end_time: range.end_time || "",
    time_zone: range.time_zone || "America/Sao_Paulo",
    services: Array.isArray(range.services) ? range.services : [],
  }));
};

const mergeWorkRanges = (
  existingRanges: WorkScheduleRange[],
  newRanges: WorkScheduleRange[]
) => {
  const merged = new Map<string, WorkScheduleRange>();

  const makeKey = (range: WorkScheduleRange) => {
    return [
      range.weekday,
      range.start_time,
      range.end_time,
      range.branch_id,
      range.time_zone,
    ].join("|");
  };

  existingRanges.forEach(range => {
    merged.set(makeKey(range), range);
  });

  newRanges.forEach(range => {
    merged.set(makeKey(range), range);
  });

  return Array.from(merged.values());
};

export const useWorkSchedule = (props?: UseWorkScheduleProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workScheduleData, setWorkScheduleData] = useState<WorkScheduleRange[]>(
    []
  );
  const { toast } = useToast();

  const requestWorkSchedule = useCallback(
    async (employeeId: string, options?: { silent?: boolean }) => {
      const response = await fetch(
        `/api/employee/${employeeId}/work_schedule`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.message || "Erro ao buscar horário de trabalho";

        if (
          !options?.silent &&
          !errorMessage.toLowerCase().includes("not found") &&
          !errorMessage.toLowerCase().includes("não encontrado")
        ) {
          toast({
            title: "Erro ao buscar horários",
            description: errorMessage,
            variant: "destructive",
          });
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      return normalizeWorkScheduleRanges(result, employeeId);
    },
    [toast]
  );

  const fetchWorkSchedule = useCallback(
    async (employeeId: string) => {
      setLoading(true);
      setError(null);

      try {
        const normalized = await requestWorkSchedule(employeeId);
        setWorkScheduleData(normalized);
        return normalized;
      } catch (err: any) {
        const message = err?.message || "Erro interno do servidor";
        setError(message);
        props?.onError?.(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [props, requestWorkSchedule]
  );

  const postWorkSchedule = useCallback(
    async (employeeId: string, payload: WorkSchedulePayload) => {
      const response = await fetch(
        `/api/employee/${employeeId}/work_schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ work_schedule: payload }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || "Erro ao salvar horário de trabalho"
        );
      }

      const result = await response.json();
      const normalized = normalizeWorkScheduleRanges(result, employeeId);
      if (normalized.length > 0) {
        setWorkScheduleData(normalized);
      }

      return result;
    },
    []
  );

  const createWorkSchedule = useCallback(
    async (employeeId: string, workScheduleData: WorkSchedulePayload) => {
      setLoading(true);
      setSuccess(false);
      setError(null);

      try {
        const result = await postWorkSchedule(employeeId, workScheduleData);
        setSuccess(true);
        props?.onSuccess?.();
        return result;
      } catch (err: any) {
        const message = err?.message || "Erro interno do servidor";
        setError(message);
        toast({
          title: "Erro ao salvar horários",
          description: message,
          variant: "destructive",
        });
        props?.onError?.(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [postWorkSchedule, props, toast]
  );

  const addWorkScheduleRanges = useCallback(
    async (employeeId: string, ranges: WorkScheduleRange[]) => {
      setLoading(true);
      setSuccess(false);
      setError(null);

      try {
        let existingRanges: WorkScheduleRange[] = [];

        try {
          existingRanges = await requestWorkSchedule(employeeId, {
            silent: true,
          });
        } catch {
          existingRanges = [];
        }

        const normalizedNewRanges = normalizeForPayload(ranges, employeeId);
        const normalizedExisting = normalizeForPayload(
          existingRanges,
          employeeId
        );
        const mergedRanges = mergeWorkRanges(
          normalizedExisting,
          normalizedNewRanges
        );

        const result = await postWorkSchedule(employeeId, {
          employee_work_ranges: mergedRanges,
        });

        setSuccess(true);
        props?.onSuccess?.();
        return result;
      } catch (err: any) {
        const message = err?.message || "Erro interno do servidor";
        setError(message);
        toast({
          title: "Erro ao salvar horários",
          description: message,
          variant: "destructive",
        });
        props?.onError?.(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [postWorkSchedule, props, requestWorkSchedule, toast]
  );

  const reset = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    fetchWorkSchedule,
    createWorkSchedule,
    addWorkScheduleRanges,
    loading,
    success,
    error,
    workScheduleData,
    reset,
  };
};
