"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetCompany } from "@/hooks/get-company";
import { useGetEmployeeById } from "@/hooks/get-employee-by-id";
import { useUploadEmployeeImage } from "@/hooks/use-upload-employee-image";
import { useEmployeeWorkRange } from "@/hooks/workSchedule/use-employee-work-range";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { useBranchWorkSchedule } from "@/hooks/workSchedule/use-branch-work-schedule";
import { WorkRangeServicesSection } from "../work-range-services-section";
import type { Branch, Employee, Service } from "../../../../../types/company";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TeamMemberTab = "info" | "services" | "schedule" | "services-schedule";

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
  { weekday: 2, label: "Terça" },
  { weekday: 3, label: "Quarta" },
  { weekday: 4, label: "Quinta" },
  { weekday: 5, label: "Sexta" },
  { weekday: 6, label: "Sábado" },
  { weekday: 0, label: "Domingo" },
];

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (member: Employee) => {
  const f = member.name?.trim().charAt(0);
  const l = member.surname?.trim().charAt(0);
  const i = [f, l].filter(Boolean).join("");
  return i ? i.toUpperCase() : "?";
};

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
  let ns = sm, ne = em, adjusted = false;
  if (ns < bsm) { ns = bsm; adjusted = true; }
  if (ne > bem) { ne = bem; adjusted = true; }
  if (ns >= ne) { ns = bsm; ne = bem; adjusted = true; }
  return { start: formatMinutes(ns), end: formatMinutes(ne), adjusted };
};

const getBranchDayRange = (branch: BranchScheduleSource | null, weekday: number) => {
  const ranges = Array.isArray(branch?.work_schedule) ? branch!.work_schedule : [];
  const match = (ranges as Record<string, unknown>[]).find(
    (r) => Number(r?.weekday) === Number(weekday),
  );
  if (!match) return null;
  const start = extractTime((match.start_time as string) || (match.start as string) || "");
  const end = extractTime((match.end_time as string) || (match.end as string) || "");
  if (!start || !end) return null;
  return { start, end };
};

const normalizeWorkSchedule = (ranges: unknown[]): NormalizedWorkRange[] => {
  if (!Array.isArray(ranges)) return [];
  return (ranges as Record<string, unknown>[])
    .map((r) => {
      const branchId = (r?.branch_id ?? (r?.branch as Record<string, unknown>)?.id ?? "") as string;
      return {
        id: r?.id ? String(r.id) : undefined,
        branch_id: branchId ? String(branchId) : "",
        weekday: Number(r?.weekday ?? 0),
        start_time: extractTime((r?.start_time as string) || (r?.start as string) || ""),
        end_time: extractTime((r?.end_time as string) || (r?.end as string) || ""),
        time_zone: (r?.time_zone as string) || DEFAULT_TIME_ZONE,
      };
    })
    .filter((r) => r.branch_id);
};

const buildBranchSchedules = (
  branches: Branch[],
  ranges: NormalizedWorkRange[],
): BranchScheduleState[] => {
  const byBranch = new Map<string, NormalizedWorkRange[]>();
  ranges.forEach((r) => {
    if (!byBranch.has(r.branch_id)) byBranch.set(r.branch_id, []);
    byBranch.get(r.branch_id)!.push(r);
  });
  return branches.map((branch) => {
    const bid = String(branch.id);
    const bRanges = byBranch.get(bid) || [];
    const byWeekday = new Map<number, NormalizedWorkRange>();
    bRanges.forEach((r) => { if (!byWeekday.has(r.weekday)) byWeekday.set(r.weekday, r); });
    const days = WEEKDAYS.map((day) => {
      const r = byWeekday.get(day.weekday);
      if (!r) return { ...day, enabled: false, start_time: "", end_time: "", time_zone: DEFAULT_TIME_ZONE };
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

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  id: string;
  initialTab?: TeamMemberTab;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamMemberPage({ id, initialTab = "info" }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [reloadKey, setReloadKey] = useState(0);
  const { employee: member, loading: memberLoading } = useGetEmployeeById(id, reloadKey);
  const [localMember, setLocalMember] = useState<Employee | null>(null);

  const { company, loading: companyLoading } = useGetCompany();
  const services: Service[] = useMemo(() => company?.services ?? [], [company]);
  const branches: Branch[] = useMemo(() => company?.branches ?? [], [company]);

  useEffect(() => {
    if (member) setLocalMember(member);
  }, [member]);

  const handleReloadMember = () => setReloadKey((k) => k + 1);

  // ── Info tab state ─────────────────────────────────────────────────────────
  const { uploadImage, loading: isUploading } = useUploadEmployeeImage();
  const emptyForm = useMemo<MemberFormState>(
    () => ({ name: "", surname: "", email: "", phone: "", role: "" }),
    [],
  );
  const [formState, setFormState] = useState<MemberFormState>(emptyForm);
  const [initialState, setInitialState] = useState<MemberFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousMemberIdRef = useRef<string | null>(null);

  // ── Schedule tab state ─────────────────────────────────────────────────────
  const { fetchBranchById } = useBranchApi();
  const { getBranchWorkSchedule } = useBranchWorkSchedule();
  const { createEmployeeWorkRange, updateEmployeeWorkRange, deleteEmployeeWorkRange, loading: isScheduleLoading } =
    useEmployeeWorkRange();
  const availableBranches = useMemo(
    () => (branches ?? []).filter((b) => b && typeof b.name === "string"),
    [branches],
  );
  const [branchSchedules, setBranchSchedules] = useState<BranchScheduleState[]>([]);
  const [branchScheduleCache, setBranchScheduleCache] = useState<Record<string, BranchScheduleSource | null>>({});

  // ── Sync form when member changes ──────────────────────────────────────────
  useEffect(() => {
    if (!localMember) return;
    const displayEmail =
      localMember.email ||
      (localMember as unknown as { user?: { email?: string } })?.user?.email || "";
    const displayPhone =
      localMember.phone ||
      (localMember as unknown as { phone_number?: string })?.phone_number || "";
    const next: MemberFormState = {
      name: localMember.name || "",
      surname: localMember.surname || "",
      email: displayEmail,
      phone: displayPhone,
      role: localMember.role || localMember.permission || "",
    };
    const isNew = previousMemberIdRef.current !== String(localMember.id);
    previousMemberIdRef.current = String(localMember.id);
    setFormState(next);
    setInitialState(next);
    if (isNew) {
      setPendingImageFile(null);
      if (avatarPreviewUrl) { URL.revokeObjectURL(avatarPreviewUrl); setAvatarPreviewUrl(null); }
    }
    const profileImageUrl = localMember?.meta?.design?.images?.profile?.url || "";
    setAvatarUrl(profileImageUrl);
    const normalized = normalizeWorkSchedule(
      Array.isArray(localMember.work_schedule) ? localMember.work_schedule : [],
    );
    setBranchSchedules(buildBranchSchedules(availableBranches, normalized));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMember]);

  useEffect(() => {
    setBranchSchedules(
      buildBranchSchedules(
        availableBranches,
        normalizeWorkSchedule(Array.isArray(localMember?.work_schedule) ? localMember!.work_schedule : []),
      ),
    );
  }, [availableBranches]);

  useEffect(() => {
    return () => { if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl); };
  }, [avatarPreviewUrl]);

  // ── Info helpers ───────────────────────────────────────────────────────────
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
    setFormState((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!localMember || !canSave) return;
    setIsSaving(true);
    let fieldsSaved = false;
    let imageSaved = false;
    try {
      if (hasChanges) {
        const res = await fetch(`/api/employee/${localMember.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formState.name.trim(),
            surname: formState.surname.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
          }),
        });
        if (!res.ok) throw new Error((await res.text().catch(() => "")) || "Erro ao atualizar profissional.");
        setInitialState(formState);
        fieldsSaved = true;
      }
      if (pendingImageFile) {
        const result = await uploadImage(localMember.id, pendingImageFile);
        if (!result) throw new Error("Erro ao enviar a foto do profissional.");
        if (result.imageUrl) {
          if (avatarPreviewUrl) { URL.revokeObjectURL(avatarPreviewUrl); setAvatarPreviewUrl(null); }
          setAvatarUrl(result.imageUrl);
        }
        setPendingImageFile(null);
        imageSaved = true;
      }
      toast({
        title: fieldsSaved && imageSaved ? "Profissional atualizado!" : fieldsSaved ? "Dados salvos!" : "Foto atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      handleReloadMember();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (!localMember || isSaving || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !localMember) return;
    const url = URL.createObjectURL(file);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(url);
    setAvatarUrl(url);
    setPendingImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Services helpers ───────────────────────────────────────────────────────
  const availableServices = useMemo(
    () => (services ?? []).filter((s) => s && typeof s.name === "string"),
    [services],
  );
  const linkedServiceIds = new Set(localMember?.services?.map((s) => s.id) ?? []);

  const handleToggleService = async (service: Service) => {
    if (!localMember || !service?.id) return;
    const isLinked = linkedServiceIds.has(service.id);
    try {
      const res = await fetch(`/api/employee/${localMember.id}/service/${service.id}`, {
        method: isLinked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error(isLinked ? "Erro ao desvincular o serviço" : "Erro ao vincular o serviço");
      setLocalMember((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          services: isLinked
            ? (prev.services ?? []).filter((s) => s.id !== service.id)
            : [...(prev.services ?? []), service],
        };
      });
      toast({
        title: isLinked ? "Serviço removido" : "Serviço vinculado",
        description: isLinked
          ? `${service.name} foi removido de ${localMember.name}.`
          : `${service.name} foi vinculado a ${localMember.name}.`,
        variant: isLinked ? "destructive" : "default",
      });
      handleReloadMember();
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message, variant: "destructive" });
    }
  };

  // ── Branch/schedule helpers ────────────────────────────────────────────────
  const linkedBranchIds = new Set(localMember?.branches?.map((b) => b.id.toString()) ?? []);

  const resolveBranchSchedule = async (branchId: string) => {
    if (branchScheduleCache[branchId]) return branchScheduleCache[branchId];
    const local = availableBranches.find((b) => String(b.id) === branchId);
    if (local?.work_schedule) {
      setBranchScheduleCache((p) => ({ ...p, [branchId]: local }));
      return local as BranchScheduleSource;
    }
    const fetched = await fetchBranchById(branchId);
    if (fetched?.work_schedule) {
      setBranchScheduleCache((p) => ({ ...p, [branchId]: fetched }));
      return fetched as BranchScheduleSource;
    }
    try {
      const ranges = await getBranchWorkSchedule(branchId);
      const hydrated: BranchScheduleSource = fetched
        ? { ...fetched, work_schedule: ranges }
        : { id: branchId, work_schedule: ranges };
      setBranchScheduleCache((p) => ({ ...p, [branchId]: hydrated }));
      return hydrated;
    } catch {
      setBranchScheduleCache((p) => ({ ...p, [branchId]: fetched ?? null }));
      return (fetched as BranchScheduleSource | null) ?? null;
    }
  };

  const updateBranchDay = (
    branchId: string,
    weekday: number,
    updater: (day: ScheduleDayState) => ScheduleDayState,
  ) => {
    setBranchSchedules((prev) =>
      prev.map((b) =>
        b.branchId !== branchId
          ? b
          : { ...b, days: b.days.map((d) => (d.weekday === weekday ? updater(d) : d)) },
      ),
    );
  };

  const handleToggleBranch = async (branch: Branch) => {
    if (!localMember || !branch?.id) return;
    const isLinked = linkedBranchIds.has(branch.id.toString());
    try {
      const res = await fetch(`/api/employee/branch/${localMember.id}/branch/${branch.id}`, {
        method: isLinked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error(isLinked ? "Erro ao desvincular a filial" : "Erro ao vincular a filial");
      setLocalMember((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          branches: isLinked
            ? (prev.branches ?? []).filter((b) => b.id !== branch.id)
            : [...(prev.branches ?? []), branch],
        };
      });
      toast({
        title: isLinked ? "Filial desvinculada" : "Filial vinculada",
        description: isLinked
          ? `${branch.name} foi removida de ${localMember.name}.`
          : `${branch.name} foi vinculada a ${localMember.name}.`,
        variant: isLinked ? "destructive" : "default",
      });
      handleReloadMember();
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleToggleScheduleDay = async (branchId: string, weekday: number, enabled: boolean) => {
    if (!localMember) return;
    const branch = branchSchedules.find((s) => s.branchId === branchId);
    const day = branch?.days.find((d) => d.weekday === weekday);
    if (!day) return;

    const prev = { ...day };
    let ns = day.start_time || DEFAULT_START_TIME;
    let ne = day.end_time || DEFAULT_END_TIME;
    const branchData = enabled ? await resolveBranchSchedule(branchId) : null;
    const range = enabled ? getBranchDayRange(branchData, weekday) : null;

    if (enabled && !range) {
      toast({ title: "Horário da filial não configurado", description: "Configure o horário da filial para este dia.", variant: "destructive" });
      updateBranchDay(branchId, weekday, () => prev);
      return;
    }

    if (range) {
      const clamped = clampToBranchRange(ns, ne, range);
      if (clamped.adjusted) { ns = clamped.start; ne = clamped.end; toast({ title: "Horário ajustado", description: "O horário foi ajustado para respeitar a filial." }); }
    }

    const next = enabled
      ? { ...day, enabled: true, start_time: ns, end_time: ne, time_zone: day.time_zone || DEFAULT_TIME_ZONE }
      : { ...day, enabled: false };
    updateBranchDay(branchId, weekday, () => next);

    try {
      const empId = localMember.id.toString();
      if (!enabled) {
        if (day.id) {
          await deleteEmployeeWorkRange(empId, day.id);
          updateBranchDay(branchId, weekday, (d) => ({ ...d, id: undefined }));
        }
        handleReloadMember();
        return;
      }
      const payload = { branch_id: branchId, weekday, start_time: next.start_time, end_time: next.end_time, time_zone: next.time_zone || DEFAULT_TIME_ZONE };
      if (day.id) {
        await updateEmployeeWorkRange(empId, day.id, payload);
      } else {
        const result = await createEmployeeWorkRange(empId, payload);
        const created = (result as { data?: { id?: string | number } })?.data;
        const createdId = created?.id ? String(created.id) : undefined;
        if (createdId) updateBranchDay(branchId, weekday, (d) => ({ ...d, id: createdId }));
      }
      handleReloadMember();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: msg.toLowerCase().includes("not within any defined branch operating hours") ? "Horário inválido" : "Erro ao salvar horário",
        description: msg.toLowerCase().includes("not within any defined branch operating hours")
          ? "O horário precisa estar dentro do horário da filial."
          : "Não foi possível salvar o horário do profissional.",
        variant: "destructive",
      });
      updateBranchDay(branchId, weekday, () => prev);
    }
  };

  const handleScheduleTimeChange = async (branchId: string, weekday: number, field: "start_time" | "end_time", value: string) => {
    if (!localMember) return;
    const branch = branchSchedules.find((s) => s.branchId === branchId);
    const day = branch?.days.find((d) => d.weekday === weekday);
    if (!day) return;
    const prev = { ...day };
    let next = { ...day, [field]: value };
    const branchData = await resolveBranchSchedule(branchId);
    const range = getBranchDayRange(branchData, weekday);
    if (!range) {
      toast({ title: "Horário da filial não configurado", description: "Configure o horário da filial para este dia.", variant: "destructive" });
      updateBranchDay(branchId, weekday, () => prev);
      return;
    }
    if (next.start_time && next.end_time) {
      const clamped = clampToBranchRange(next.start_time, next.end_time, range);
      if (clamped.adjusted) {
        next = { ...next, start_time: clamped.start, end_time: clamped.end };
        toast({ title: "Horário ajustado", description: "O horário precisa estar dentro do horário da filial." });
      }
    }
    updateBranchDay(branchId, weekday, () => next);
    if (!next.start_time || !next.end_time) return;
    try {
      const empId = localMember.id.toString();
      const payload = { branch_id: branchId, weekday, start_time: next.start_time, end_time: next.end_time, time_zone: next.time_zone || DEFAULT_TIME_ZONE };
      if (day.id) {
        await updateEmployeeWorkRange(empId, day.id, payload);
      } else {
        const result = await createEmployeeWorkRange(empId, payload);
        const created = (result as { data?: { id?: string | number } })?.data;
        const createdId = created?.id ? String(created.id) : undefined;
        if (createdId) updateBranchDay(branchId, weekday, (d) => ({ ...d, id: createdId, enabled: true }));
      }
      handleReloadMember();
    } catch (error) {
      toast({ title: "Erro ao salvar horário", description: "Não foi possível salvar o horário do profissional.", variant: "destructive" });
      updateBranchDay(branchId, weekday, () => prev);
    }
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const isLoading = memberLoading && !localMember;
  const memberName = localMember ? `${localMember.name || ""} ${localMember.surname || ""}`.trim() : "";
  const memberRole = localMember ? (localMember.role || localMember.permission || "Profissional") : "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-4xl p-6 lg:p-8 space-y-6 pb-12">

          {/* ── Back + Header ── */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/your-team")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Equipe</p>
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <h1 className="text-xl font-bold text-foreground truncate">{memberName || "Profissional"}</h1>
              )}
            </div>
          </div>

          {/* ── Profile card ── */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-background p-6 flex items-center gap-5 shadow-sm">
            {isLoading ? (
              <Skeleton className="h-20 w-20 rounded-2xl flex-shrink-0" />
            ) : (
              <button
                type="button"
                className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
                onClick={handleAvatarClick}
                title="Trocar foto"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={memberName} className="h-full w-full object-cover" />
                ) : localMember ? (
                  getInitials(localMember)
                ) : "?"}
              </button>
            )}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-foreground leading-tight">{memberName || "—"}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{memberRole}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{memberRole}</Badge>
                    {localMember?.is_active ? (
                      <Badge className="text-xs bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/15">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Inativo</Badge>
                    )}
                    {localMember?.email && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {localMember.email}
                      </span>
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
          <Tabs defaultValue={initialTab} className="space-y-0">
            <TabsList className="w-full justify-start rounded-xl border border-border bg-muted/30 p-1 h-auto gap-1">
              <TabsTrigger value="info" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all">
                <User className="w-4 h-4 mr-1.5 inline-block" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="services" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all">
                <Sparkles className="w-4 h-4 mr-1.5 inline-block" />
                Serviços
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all">
                <Clock className="w-4 h-4 mr-1.5 inline-block" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="services-schedule" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all">
                <Calendar className="w-4 h-4 mr-1.5 inline-block" />
                Por Horário
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Perfil ── */}
            <TabsContent value="info" className="mt-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                        <button
                          type="button"
                          className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0 hover:opacity-90 transition-opacity overflow-hidden"
                          onClick={handleAvatarClick}
                          disabled={isSaving || isUploading}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={memberName} className="h-full w-full object-cover" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium">Foto do profissional</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Clique na imagem para alterar a foto.</p>
                          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAvatarClick} disabled={isSaving || isUploading}>
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            {isUploading ? "Enviando..." : "Escolher arquivo"}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="tm-name">Nome</Label>
                          <Input id="tm-name" value={formState.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder="Nome do profissional" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tm-surname">Sobrenome</Label>
                          <Input id="tm-surname" value={formState.surname} onChange={(e) => handleFieldChange("surname", e.target.value)} placeholder="Sobrenome" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tm-email">E-mail</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="tm-email" type="email" value={formState.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="email@exemplo.com" className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="tm-phone">Telefone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input id="tm-phone" type="tel" value={formState.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="+5511999999999" className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="tm-role">Perfil</Label>
                          <Input id="tm-role" value={formState.role} readOnly placeholder="Perfil não informado" className="bg-muted/30" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {!isLoading && (
                  <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
                    <Button
                      className="btn-gradient"
                      onClick={handleSave}
                      disabled={isSaving || isUploading || !canSave}
                    >
                      {isSaving ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Tab: Serviços ── */}
            <TabsContent value="services" className="mt-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                {isLoading || companyLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
                ) : availableServices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Nenhum serviço cadastrado</p>
                    <p className="text-xs mt-1">Crie serviços na seção de serviços antes de vinculá-los.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Selecione os serviços que este profissional realiza.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableServices.map((service) => {
                        const isLinked = linkedServiceIds.has(service.id);
                        const price = service.price && Number(service.price) > 0
                          ? `R$ ${Number(service.price).toFixed(2)}`
                          : "Gratuito";
                        const duration = service.duration ? `${service.duration} min` : "--";
                        return (
                          <div
                            key={service.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isLinked}
                            onClick={() => handleToggleService(service)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggleService(service); } }}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isLinked
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/30"
                            }`}
                          >
                            <Checkbox checked={isLinked} className="pointer-events-none" tabIndex={-1} aria-hidden />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {isLinked && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                                <span className={`text-sm font-medium truncate ${isLinked ? "text-primary" : ""}`}>{service.name}</span>
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
                      <p className="text-xs text-amber-600 dark:text-amber-400">Selecione pelo menos um serviço para que o profissional apareça no agendamento público.</p>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* ── Tab: Filiais & Horários ── */}
            <TabsContent value="schedule" className="mt-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-6">
                {isLoading || companyLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Filiais vinculadas</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Selecione as filiais onde este profissional atende.</p>
                      </div>
                      {availableBranches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhuma filial cadastrada.</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableBranches.map((branch) => {
                            const isLinked = linkedBranchIds.has(branch.id.toString());
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

                    {linkedBranchIds.size === 0 ? (
                      <div className="text-center py-10 rounded-2xl bg-muted/30 border border-dashed border-border text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Vincule ao menos uma filial para configurar os horários.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold">Horários de atendimento</Label>
                        {branchSchedules
                          .filter((b) => linkedBranchIds.has(b.branchId))
                          .map((branch) => (
                            <div key={branch.branchId} className="rounded-xl border border-border overflow-hidden">
                              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">{branch.branchName}</span>
                              </div>
                              <div className="divide-y divide-border">
                                {branch.days.map((day) => (
                                  <div key={`${branch.branchId}-${day.weekday}`} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                                    <Switch
                                      checked={day.enabled}
                                      onCheckedChange={(checked) => handleToggleScheduleDay(branch.branchId, day.weekday, checked)}
                                      disabled={isScheduleLoading}
                                    />
                                    <span className="w-20 text-sm font-medium">{day.label}</span>
                                    {day.enabled ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="time"
                                          value={day.start_time}
                                          onChange={(e) => handleScheduleTimeChange(branch.branchId, day.weekday, "start_time", e.target.value)}
                                          className="w-28 h-8 text-sm"
                                          disabled={isScheduleLoading}
                                        />
                                        <span className="text-muted-foreground text-xs">até</span>
                                        <Input
                                          type="time"
                                          value={day.end_time}
                                          onChange={(e) => handleScheduleTimeChange(branch.branchId, day.weekday, "end_time", e.target.value)}
                                          className="w-28 h-8 text-sm"
                                          disabled={isScheduleLoading}
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Folga</span>
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
            </TabsContent>

            {/* ── Tab: Por Horário ── */}
            <TabsContent value="services-schedule" className="mt-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                  </div>
                ) : localMember ? (
                  <WorkRangeServicesSection
                    selectedMember={localMember}
                    setSelectedMember={setLocalMember}
                    onReloadMember={handleReloadMember}
                    services={services}
                    loadingServices={companyLoading}
                  />
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
