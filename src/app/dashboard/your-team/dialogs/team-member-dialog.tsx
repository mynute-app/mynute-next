"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUploadEmployeeImage } from "@/hooks/use-upload-employee-image";
import { useEmployeeWorkRange } from "@/hooks/workSchedule/use-employee-work-range";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { useBranchWorkSchedule } from "@/hooks/workSchedule/use-branch-work-schedule";
import { WorkRangeServicesSection } from "../work-range-services-section";
import type { Branch, Employee, Service } from "../../../../../types/company";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TeamMemberDialogTab =
  | "info"
  | "services"
  | "schedule"
  | "services-schedule";

type MemberFormState = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
};

type ScheduleDayState = {
  weekday: number;
  label: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
  time_zone: string;
  id?: string;
};

type BranchScheduleState = {
  branchId: string;
  branchName: string;
  days: ScheduleDayState[];
};

type NormalizedWorkRange = {
  id?: string;
  branch_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  time_zone: string;
};

type BranchScheduleSource = {
  id: string | number;
  work_schedule?: unknown[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS: Array<Pick<ScheduleDayState, "weekday" | "label">> = [
  { weekday: 1, label: "Segunda" },
  { weekday: 2, label: "Terca" },
  { weekday: 3, label: "Quarta" },
  { weekday: 4, label: "Quinta" },
  { weekday: 5, label: "Sexta" },
  { weekday: 6, label: "Sabado" },
  { weekday: 0, label: "Domingo" },
];

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractTime = (value?: string) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toTimeString().slice(0, 5);
  } catch {}
  return value.includes(":") ? value.slice(0, 5) : "";
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

const formatMinutes = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

const clampToBranchRange = (
  start: string,
  end: string,
  range: { start: string; end: string },
) => {
  const sm = toMinutes(start);
  const em = toMinutes(end);
  const bsm = toMinutes(range.start);
  const bem = toMinutes(range.end);
  if (sm === null || em === null || bsm === null || bem === null)
    return { start, end, adjusted: false };

  let ns = sm,
    ne = em,
    adjusted = false;
  if (ns < bsm) {
    ns = bsm;
    adjusted = true;
  }
  if (ne > bem) {
    ne = bem;
    adjusted = true;
  }
  if (ns >= ne) {
    ns = bsm;
    ne = bem;
    adjusted = true;
  }
  return { start: formatMinutes(ns), end: formatMinutes(ne), adjusted };
};

const getBranchDayRange = (
  branch: BranchScheduleSource | null,
  weekday: number,
) => {
  const ranges = Array.isArray(branch?.work_schedule)
    ? branch!.work_schedule
    : [];
  const match = (ranges as Record<string, unknown>[]).find(
    r => Number(r?.weekday) === Number(weekday),
  );
  if (!match) return null;
  const start = extractTime(
    (match.start_time as string) || (match.start as string) || "",
  );
  const end = extractTime(
    (match.end_time as string) || (match.end as string) || "",
  );
  if (!start || !end) return null;
  return { start, end };
};

const normalizeWorkSchedule = (ranges: unknown[]): NormalizedWorkRange[] => {
  if (!Array.isArray(ranges)) return [];
  return (ranges as Record<string, unknown>[])
    .map(r => {
      const branchId = (r?.branch_id ??
        (r?.branch as Record<string, unknown>)?.id ??
        "") as string;
      return {
        id: r?.id ? String(r.id) : undefined,
        branch_id: branchId ? String(branchId) : "",
        weekday: Number(r?.weekday ?? 0),
        start_time: extractTime(
          (r?.start_time as string) || (r?.start as string) || "",
        ),
        end_time: extractTime(
          (r?.end_time as string) || (r?.end as string) || "",
        ),
        time_zone: (r?.time_zone as string) || DEFAULT_TIME_ZONE,
      };
    })
    .filter(r => r.branch_id);
};

const buildBranchSchedules = (
  branches: Branch[],
  ranges: NormalizedWorkRange[],
): BranchScheduleState[] => {
  const byBranch = new Map<string, NormalizedWorkRange[]>();
  ranges.forEach(r => {
    if (!byBranch.has(r.branch_id)) byBranch.set(r.branch_id, []);
    byBranch.get(r.branch_id)!.push(r);
  });

  return branches.map(branch => {
    const bid = String(branch.id);
    const bRanges = byBranch.get(bid) || [];
    const byWeekday = new Map<number, NormalizedWorkRange>();
    bRanges.forEach(r => {
      if (!byWeekday.has(r.weekday)) byWeekday.set(r.weekday, r);
    });

    const days = WEEKDAYS.map(day => {
      const r = byWeekday.get(day.weekday);
      if (!r)
        return {
          ...day,
          enabled: false,
          start_time: "",
          end_time: "",
          time_zone: DEFAULT_TIME_ZONE,
        };
      return {
        ...day,
        enabled: Boolean(r.id || r.start_time || r.end_time),
        start_time: r.start_time,
        end_time: r.end_time,
        time_zone: r.time_zone || DEFAULT_TIME_ZONE,
        id: r.id,
      };
    });

    return { branchId: bid, branchName: branch.name, days };
  });
};

const getInitials = (member: Employee) => {
  const f = member.name?.trim().charAt(0);
  const l = member.surname?.trim().charAt(0);
  const i = [f, l].filter(Boolean).join("");
  return i ? i.toUpperCase() : "?";
};

// ─── Props ────────────────────────────────────────────────────────────────────

type TeamMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Employee | null;
  setMember: React.Dispatch<React.SetStateAction<Employee | null>>;
  activeTab?: TeamMemberDialogTab;
  onReloadMember?: () => void;
  services?: Service[];
  loadingServices?: boolean;
  branches?: Branch[];
  loadingBranches?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TeamMemberDialog({
  open,
  onOpenChange,
  member,
  setMember,
  activeTab = "info",
  onReloadMember,
  services = [],
  loadingServices = false,
  branches = [],
  loadingBranches = false,
}: TeamMemberDialogProps) {
  const { toast } = useToast();

  // ── Info tab state ──────────────────────────────────────────────────────────
  const { uploadImage, loading: isUploading } = useUploadEmployeeImage();
  const emptyForm = useMemo<MemberFormState>(
    () => ({ name: "", surname: "", email: "", phone: "", role: "" }),
    [],
  );
  const [formState, setFormState] = useState<MemberFormState>(emptyForm);
  const [initialState, setInitialState] = useState<MemberFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [serverAvatarUrl, setServerAvatarUrl] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousMemberIdRef = useRef<string | null>(null);

  // ── Schedule tab state ──────────────────────────────────────────────────────
  const { fetchBranchById } = useBranchApi();
  const { getBranchWorkSchedule } = useBranchWorkSchedule();
  const {
    createEmployeeWorkRange,
    updateEmployeeWorkRange,
    deleteEmployeeWorkRange,
    loading: isScheduleLoading,
  } = useEmployeeWorkRange();
  const availableBranches = useMemo(
    () => (branches ?? []).filter(b => b && typeof b.name === "string"),
    [branches],
  );
  const [branchSchedules, setBranchSchedules] = useState<BranchScheduleState[]>(
    [],
  );
  const [branchScheduleCache, setBranchScheduleCache] = useState<
    Record<string, BranchScheduleSource | null>
  >({});

  // ── Sync form when member changes ───────────────────────────────────────────
  useEffect(() => {
    if (!open || !member) {
      setFormState(emptyForm);
      setInitialState(emptyForm);
      setAvatarUrl("");
      setServerAvatarUrl("");
      setPendingImageFile(null);
      previousMemberIdRef.current = null;
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
      setBranchSchedules([]);
      return;
    }

    const displayEmail =
      member.email ||
      (member as unknown as { user?: { email?: string } })?.user?.email ||
      "";
    const displayPhone =
      member.phone ||
      (member as unknown as { phone_number?: string })?.phone_number ||
      "";
    const displayRole = member.role || member.permission || "";

    const next: MemberFormState = {
      name: member.name || "",
      surname: member.surname || "",
      email: displayEmail,
      phone: displayPhone,
      role: displayRole,
    };
    setFormState(next);
    setInitialState(next);

    const profileImageUrl = member?.meta?.design?.images?.profile?.url || "";
    const nextId = member.id != null ? String(member.id) : null;
    const isNew = previousMemberIdRef.current !== nextId;
    previousMemberIdRef.current = nextId;

    if (isNew) {
      setPendingImageFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
    }
    setServerAvatarUrl(profileImageUrl);
    if (!pendingImageFile || isNew) setAvatarUrl(profileImageUrl);

    // schedule
    const normalized = normalizeWorkSchedule(
      Array.isArray(member.work_schedule) ? member.work_schedule : [],
    );
    setBranchSchedules(buildBranchSchedules(availableBranches, normalized));
  }, [member, open, emptyForm]);

  useEffect(() => {
    setBranchSchedules(
      buildBranchSchedules(
        availableBranches,
        normalizeWorkSchedule(
          Array.isArray(member?.work_schedule) ? member!.work_schedule : [],
        ),
      ),
    );
  }, [availableBranches]);

  // cleanup blob URLs
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  // ── Info helpers ────────────────────────────────────────────────────────────
  const hasChanges = useMemo(
    () =>
      formState.name.trim() !== initialState.name.trim() ||
      formState.surname.trim() !== initialState.surname.trim() ||
      formState.email.trim() !== initialState.email.trim() ||
      formState.phone.trim() !== initialState.phone.trim(),
    [formState, initialState],
  );
  const canSave = hasChanges || Boolean(pendingImageFile);

  const handleFieldChange = (field: keyof MemberFormState, value: string) =>
    setFormState(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!member) return;
    if (!canSave) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    let fieldsSaved = false;
    let imageSaved = false;
    try {
      if (hasChanges) {
        const res = await fetch(`/api/employee/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formState.name.trim(),
            surname: formState.surname.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
          }),
        });
        if (!res.ok)
          throw new Error(
            (await res.text().catch(() => "")) ||
              "Erro ao atualizar profissional.",
          );
        setInitialState(formState);
        fieldsSaved = true;
      }

      if (pendingImageFile) {
        const result = await uploadImage(member.id, pendingImageFile);
        if (!result) throw new Error("Erro ao enviar a foto do profissional.");
        if (result.imageUrl) {
          if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
            setAvatarPreviewUrl(null);
          }
          setServerAvatarUrl(result.imageUrl);
          setAvatarUrl(result.imageUrl);
        }
        setPendingImageFile(null);
        imageSaved = true;
      }

      toast({
        title:
          fieldsSaved && imageSaved
            ? "Profissional atualizado!"
            : fieldsSaved
              ? "Dados salvos!"
              : "Foto atualizada",
        description:
          fieldsSaved && imageSaved
            ? "Dados e foto foram salvos com sucesso."
            : fieldsSaved
              ? "As informações foram salvas."
              : "A imagem do profissional foi atualizada.",
      });

      if (fieldsSaved || imageSaved) onReloadMember?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (!member || isSaving || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;
    const url = URL.createObjectURL(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(url);
    setAvatarUrl(url);
    setPendingImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Services helpers ────────────────────────────────────────────────────────
  const availableServices = (services ?? []).filter(
    s => s && typeof s.name === "string",
  );
  const linkedServiceIds = new Set(member?.services?.map(s => s.id) ?? []);

  const handleToggleService = async (service: Service) => {
    if (!member || !service?.id) return;
    const isLinked = linkedServiceIds.has(service.id);
    try {
      const res = await fetch(
        `/api/employee/${member.id}/service/${service.id}`,
        {
          method: isLinked ? "DELETE" : "POST",
        },
      );
      if (!res.ok)
        throw new Error(
          isLinked
            ? "Erro ao desvincular o serviço"
            : "Erro ao vincular o serviço",
        );

      setMember(prev => {
        if (!prev) return prev;
        const nextServices = isLinked
          ? (prev.services ?? []).filter(s => s.id !== service.id)
          : [...(prev.services ?? []), service];
        return { ...prev, services: nextServices };
      });

      toast({
        title: isLinked ? "Serviço removido" : "Serviço vinculado",
        description: isLinked
          ? `${service.name} foi removido de ${member.name}.`
          : `${service.name} foi vinculado a ${member.name}.`,
        variant: isLinked ? "destructive" : "default",
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  // ── Branch/schedule helpers ─────────────────────────────────────────────────
  const linkedBranchIds = new Set(
    member?.branches?.map(b => b.id.toString()) ?? [],
  );

  const resolveBranchSchedule = async (branchId: string) => {
    if (branchScheduleCache[branchId]) return branchScheduleCache[branchId];
    const local = availableBranches.find(b => String(b.id) === branchId);
    if (local?.work_schedule) {
      setBranchScheduleCache(p => ({ ...p, [branchId]: local }));
      return local as BranchScheduleSource;
    }
    const fetched = await fetchBranchById(branchId);
    if (fetched?.work_schedule) {
      setBranchScheduleCache(p => ({ ...p, [branchId]: fetched }));
      return fetched as BranchScheduleSource;
    }
    try {
      const ranges = await getBranchWorkSchedule(branchId);
      const hydrated: BranchScheduleSource = fetched
        ? { ...fetched, work_schedule: ranges }
        : { id: branchId, work_schedule: ranges };
      setBranchScheduleCache(p => ({ ...p, [branchId]: hydrated }));
      return hydrated;
    } catch {
      setBranchScheduleCache(p => ({ ...p, [branchId]: fetched ?? null }));
      return (fetched as BranchScheduleSource | null) ?? null;
    }
  };

  const updateBranchDay = (
    branchId: string,
    weekday: number,
    updater: (day: ScheduleDayState) => ScheduleDayState,
  ) => {
    setBranchSchedules(prev =>
      prev.map(b =>
        b.branchId !== branchId
          ? b
          : {
              ...b,
              days: b.days.map(d => (d.weekday === weekday ? updater(d) : d)),
            },
      ),
    );
  };

  const handleToggleBranch = async (branch: Branch) => {
    if (!member || !branch?.id) return;
    const isLinked = linkedBranchIds.has(branch.id.toString());
    try {
      const res = await fetch(
        `/api/employee/branch/${member.id}/branch/${branch.id}`,
        {
          method: isLinked ? "DELETE" : "POST",
        },
      );
      if (!res.ok)
        throw new Error(
          isLinked
            ? "Erro ao desvincular a filial"
            : "Erro ao vincular a filial",
        );
      setMember(prev => {
        if (!prev) return prev;
        const nextBranches = isLinked
          ? (prev.branches ?? []).filter(b => b.id !== branch.id)
          : [...(prev.branches ?? []), branch];
        return { ...prev, branches: nextBranches };
      });
      toast({
        title: isLinked ? "Filial desvinculada" : "Filial vinculada",
        description: isLinked
          ? `${branch.name} foi removida de ${member.name}.`
          : `${branch.name} foi vinculada a ${member.name}.`,
        variant: isLinked ? "destructive" : "default",
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleToggleScheduleDay = async (
    branchId: string,
    weekday: number,
    enabled: boolean,
  ) => {
    if (!member) return;
    const branch = branchSchedules.find(s => s.branchId === branchId);
    const day = branch?.days.find(d => d.weekday === weekday);
    if (!day) return;

    const prev = { ...day };
    let ns = day.start_time || DEFAULT_START_TIME;
    let ne = day.end_time || DEFAULT_END_TIME;

    const branchData = enabled ? await resolveBranchSchedule(branchId) : null;
    const range = enabled ? getBranchDayRange(branchData, weekday) : null;

    if (enabled && !range) {
      toast({
        title: "Horário da filial não configurado",
        description: "Configure o horário da filial para este dia.",
        variant: "destructive",
      });
      updateBranchDay(branchId, weekday, () => prev);
      return;
    }

    if (range) {
      const clamped = clampToBranchRange(ns, ne, range);
      if (clamped.adjusted) {
        ns = clamped.start;
        ne = clamped.end;
        toast({
          title: "Horário ajustado",
          description: "O horário foi ajustado para respeitar a filial.",
        });
      }
    }

    const next = enabled
      ? {
          ...day,
          enabled: true,
          start_time: ns,
          end_time: ne,
          time_zone: day.time_zone || DEFAULT_TIME_ZONE,
        }
      : { ...day, enabled: false };

    updateBranchDay(branchId, weekday, () => next);

    try {
      const empId = member.id.toString();
      if (!enabled) {
        if (day.id) {
          await deleteEmployeeWorkRange(empId, day.id);
          updateBranchDay(branchId, weekday, d => ({ ...d, id: undefined }));
        }
        onReloadMember?.();
        return;
      }
      const payload = {
        branch_id: branchId,
        weekday,
        start_time: next.start_time,
        end_time: next.end_time,
        time_zone: next.time_zone || DEFAULT_TIME_ZONE,
      };
      if (day.id) {
        await updateEmployeeWorkRange(empId, day.id, payload);
      } else {
        const result = await createEmployeeWorkRange(empId, payload);
        const created = (result as { data?: { id?: string | number } })?.data;
        const createdId = created?.id ? String(created.id) : undefined;
        if (createdId)
          updateBranchDay(branchId, weekday, d => ({ ...d, id: createdId }));
      }
      onReloadMember?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: msg
          .toLowerCase()
          .includes("not within any defined branch operating hours")
          ? "Horário inválido"
          : "Erro ao salvar horário",
        description: msg
          .toLowerCase()
          .includes("not within any defined branch operating hours")
          ? "O horário precisa estar dentro do horário da filial."
          : "Não foi possível salvar o horário do profissional.",
        variant: "destructive",
      });
      updateBranchDay(branchId, weekday, () => prev);
    }
  };

  const handleScheduleTimeChange = async (
    branchId: string,
    weekday: number,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    if (!member) return;
    const branch = branchSchedules.find(s => s.branchId === branchId);
    const day = branch?.days.find(d => d.weekday === weekday);
    if (!day) return;

    const prev = { ...day };
    let next = { ...day, [field]: value };

    const branchData = await resolveBranchSchedule(branchId);
    const range = getBranchDayRange(branchData, weekday);

    if (!range) {
      toast({
        title: "Horário da filial não configurado",
        description: "Configure o horário da filial para este dia.",
        variant: "destructive",
      });
      updateBranchDay(branchId, weekday, () => prev);
      return;
    }

    if (next.start_time && next.end_time) {
      const clamped = clampToBranchRange(next.start_time, next.end_time, range);
      if (clamped.adjusted) {
        next = { ...next, start_time: clamped.start, end_time: clamped.end };
        toast({
          title: "Horário ajustado",
          description: "O horário precisa estar dentro do horário da filial.",
        });
      }
    }

    updateBranchDay(branchId, weekday, () => next);
    if (!next.start_time || !next.end_time) return;

    try {
      const empId = member.id.toString();
      const payload = {
        branch_id: branchId,
        weekday,
        start_time: next.start_time,
        end_time: next.end_time,
        time_zone: next.time_zone || DEFAULT_TIME_ZONE,
      };
      if (day.id) {
        await updateEmployeeWorkRange(empId, day.id, payload);
      } else {
        const result = await createEmployeeWorkRange(empId, payload);
        const created = (result as { data?: { id?: string | number } })?.data;
        const createdId = created?.id ? String(created.id) : undefined;
        if (createdId)
          updateBranchDay(branchId, weekday, d => ({
            ...d,
            id: createdId,
            enabled: true,
          }));
      }
      onReloadMember?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: msg
          .toLowerCase()
          .includes("not within any defined branch operating hours")
          ? "Horário inválido"
          : "Erro ao salvar horário",
        description: "Não foi possível salvar o horário do profissional.",
        variant: "destructive",
      });
      updateBranchDay(branchId, weekday, () => prev);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const memberName = member
    ? `${member.name || ""} ${member.surname || ""}`.trim()
    : "";
  const memberRole = member
    ? member.role || member.permission || "Profissional"
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 py-5 border-b bg-gradient-to-r from-muted/40 to-background">
          {!member ? (
            <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
          ) : (
            <button
              type="button"
              className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-lg font-bold flex-shrink-0 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
              onClick={handleAvatarClick}
              title="Trocar foto"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={memberName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(member)
              )}
            </button>
          )}

          <div className="flex-1 min-w-0">
            {!member ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-foreground text-base leading-tight truncate">
                  {memberName || "—"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {memberRole}
                  </Badge>
                  {member.is_active ? (
                    <Badge className="text-xs bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/15">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      Inativo
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* ── Tabs ── */}
        <Tabs
          defaultValue={activeTab}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-auto py-0 gap-0 shrink-0">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium transition-colors"
            >
              <User className="w-4 h-4 mr-1.5" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Serviços
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium transition-colors"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Filiais & Horários
            </TabsTrigger>
            <TabsTrigger
              value="services-schedule"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Por Horário
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Perfil ── */}
          <TabsContent
            value="info"
            className="flex-1 min-h-0 mt-0 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-6 space-y-6">
                {!member ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Avatar upload area */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                      <button
                        type="button"
                        className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0 hover:opacity-90 transition-opacity overflow-hidden"
                        onClick={handleAvatarClick}
                        disabled={isSaving || isUploading}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={memberName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <p className="text-sm font-medium">
                          Foto do profissional
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Clique na imagem ou no botão para alterar a foto.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={handleAvatarClick}
                          disabled={isSaving || isUploading}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          {isUploading ? "Enviando..." : "Escolher arquivo"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="tm-name">Nome</Label>
                        <Input
                          id="tm-name"
                          value={formState.name}
                          onChange={e =>
                            handleFieldChange("name", e.target.value)
                          }
                          placeholder="Nome do profissional"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tm-surname">Sobrenome</Label>
                        <Input
                          id="tm-surname"
                          value={formState.surname}
                          onChange={e =>
                            handleFieldChange("surname", e.target.value)
                          }
                          placeholder="Sobrenome"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tm-email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="tm-email"
                            type="email"
                            value={formState.email}
                            onChange={e =>
                              handleFieldChange("email", e.target.value)
                            }
                            placeholder="email@exemplo.com"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tm-phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="tm-phone"
                            type="tel"
                            value={formState.phone}
                            onChange={e =>
                              handleFieldChange("phone", e.target.value)
                            }
                            placeholder="+5511999999999"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="tm-role">Perfil</Label>
                        <Input
                          id="tm-role"
                          value={formState.role}
                          readOnly
                          placeholder="Perfil não informado"
                          className="bg-muted/30"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isUploading}
              >
                Cancelar
              </Button>
              <Button
                className="btn-gradient"
                onClick={handleSave}
                disabled={!member || isSaving || isUploading || !canSave}
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab: Serviços ── */}
          <TabsContent
            value="services"
            className="flex-1 min-h-0 mt-0 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-6 space-y-4">
                {!member ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : loadingServices ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Carregando serviços...
                  </div>
                ) : availableServices.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum serviço cadastrado.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Selecione os serviços que este profissional realiza.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableServices.map(service => {
                        const isLinked = linkedServiceIds.has(service.id);
                        const price =
                          service.price && Number(service.price) > 0
                            ? `R$ ${Number(service.price).toFixed(2)}`
                            : "Gratuito";
                        const duration = service.duration
                          ? `${service.duration} min`
                          : "--";
                        return (
                          <div
                            key={service.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isLinked}
                            onClick={() => handleToggleService(service)}
                            onKeyDown={e => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleToggleService(service);
                              }
                            }}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isLinked
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/30"
                            }`}
                          >
                            <Checkbox
                              checked={isLinked}
                              className="pointer-events-none"
                              tabIndex={-1}
                              aria-hidden
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {isLinked && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                )}
                                <span
                                  className={`text-sm font-medium truncate ${isLinked ? "text-primary" : ""}`}
                                >
                                  {service.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                <span>{duration}</span>
                                <span>{price}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {linkedServiceIds.size === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        Selecione pelo menos um serviço para que o profissional
                        apareça no agendamento público.
                      </p>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab: Filiais & Horários ── */}
          <TabsContent
            value="schedule"
            className="flex-1 min-h-0 mt-0 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-6 space-y-6">
                {!member ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Branch selection */}
                    <div className="space-y-3">
                      <div>
                        <Label>Filiais vinculadas</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Selecione as filiais onde este profissional atende.
                        </p>
                      </div>
                      {loadingBranches ? (
                        <div className="flex gap-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
                          ))}
                        </div>
                      ) : availableBranches.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Nenhuma filial cadastrada.</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableBranches.map(branch => {
                            const isLinked = linkedBranchIds.has(
                              branch.id.toString(),
                            );
                            return (
                              <button
                                key={branch.id}
                                type="button"
                                onClick={() => handleToggleBranch(branch)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                  isLinked
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                {branch.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Schedule per branch */}
                    {linkedBranchIds.size === 0 ? (
                      <div className="text-center py-8 rounded-xl bg-muted/30 border border-dashed border-border text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">
                          Vincule ao menos uma filial para configurar os
                          horários.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <Label>Horários de atendimento</Label>
                        {branchSchedules
                          .filter(b => linkedBranchIds.has(b.branchId))
                          .map(branch => (
                            <div
                              key={branch.branchId}
                              className="rounded-xl border border-border overflow-hidden"
                            >
                              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">
                                  {branch.branchName}
                                </span>
                              </div>
                              <div className="divide-y divide-border">
                                {branch.days.map(day => (
                                  <div
                                    key={`${branch.branchId}-${day.weekday}`}
                                    className="flex items-center gap-3 px-4 py-3"
                                  >
                                    <Switch
                                      checked={day.enabled}
                                      onCheckedChange={checked =>
                                        handleToggleScheduleDay(
                                          branch.branchId,
                                          day.weekday,
                                          checked,
                                        )
                                      }
                                      disabled={isScheduleLoading}
                                    />
                                    <span className="w-20 text-sm font-medium">
                                      {day.label}
                                    </span>
                                    {day.enabled ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="time"
                                          value={day.start_time}
                                          onChange={e =>
                                            handleScheduleTimeChange(
                                              branch.branchId,
                                              day.weekday,
                                              "start_time",
                                              e.target.value,
                                            )
                                          }
                                          className="w-28 h-8 text-sm"
                                          disabled={isScheduleLoading}
                                        />
                                        <span className="text-muted-foreground text-xs">
                                          até
                                        </span>
                                        <Input
                                          type="time"
                                          value={day.end_time}
                                          onChange={e =>
                                            handleScheduleTimeChange(
                                              branch.branchId,
                                              day.weekday,
                                              "end_time",
                                              e.target.value,
                                            )
                                          }
                                          className="w-28 h-8 text-sm"
                                          disabled={isScheduleLoading}
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        Folga
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </TabsContent>

          {/* ── Tab: Serviços por Horário ── */}
          <TabsContent
            value="services-schedule"
            className="flex-1 min-h-0 mt-0 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-6">
                {!member ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <WorkRangeServicesSection
                    selectedMember={member}
                    setSelectedMember={setMember}
                    onReloadMember={onReloadMember}
                    services={services}
                    loadingServices={loadingServices}
                  />
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
