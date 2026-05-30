"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Globe,
  Hash,
  Home,
  ImagePlus,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/hooks/use-toast";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { useBranchImage } from "@/hooks/branch/use-branch-image";
import { useBranchWorkSchedule } from "@/hooks/workSchedule/use-branch-work-schedule";
import type { BranchWorkScheduleRange } from "@/hooks/workSchedule/use-branch-work-schedule";
import { useWorkRange } from "@/hooks/workSchedule/use-work-range";
import { useEmployeeApi } from "@/hooks/employee/use-employee-api";
import { useGetCompany } from "@/hooks/get-company";
import { cn } from "@/lib/utils";
import type { Branch, Employee, Service } from "../../../../../types/company";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BranchDetailTab = "info" | "schedule" | "services" | "team";

type Props = {
  branchId: string;
  initialTab?: BranchDetailTab;
};

type BranchEditFormValues = {
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
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

type ScheduleRange = BranchWorkScheduleRange & {
  id?: string | number;
  start?: string;
  end?: string;
};

type ScheduleUpdatePayload = {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS: Array<Pick<ScheduleDayState, "weekday" | "label">> = [
  { weekday: 1, label: "Segunda-feira" },
  { weekday: 2, label: "Terça-feira" },
  { weekday: 3, label: "Quarta-feira" },
  { weekday: 4, label: "Quinta-feira" },
  { weekday: 5, label: "Sexta-feira" },
  { weekday: 6, label: "Sábado" },
  { weekday: 0, label: "Domingo" },
];

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildDefaultValues = (branch: Branch | null): BranchEditFormValues => ({
  name: branch?.name ?? "",
  street: branch?.street ?? "",
  number: branch?.number ?? "",
  complement: branch?.complement ?? "",
  neighborhood: branch?.neighborhood ?? "",
  zip_code: branch?.zip_code ?? "",
  city: branch?.city ?? "",
  state: branch?.state ?? "",
  country: branch?.country ?? "",
});

const extractTime = (value?: string) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toTimeString().slice(0, 5);
  } catch {
    return value.includes(":") ? value.slice(0, 5) : "";
  }
  return value.includes(":") ? value.slice(0, 5) : "";
};

const buildScheduleState = (
  ranges: ScheduleRange[] | null | undefined,
): ScheduleDayState[] => {
  const byWeekday = new Map<number, ScheduleRange>();
  (ranges ?? []).forEach(range => {
    const weekday = Number(range.weekday);
    if (!Number.isFinite(weekday) || byWeekday.has(weekday)) return;
    byWeekday.set(weekday, range);
  });

  return WEEKDAYS.map(day => {
    const range = byWeekday.get(day.weekday);
    if (!range) {
      return {
        ...day,
        enabled: false,
        start_time: "",
        end_time: "",
        time_zone: DEFAULT_TIME_ZONE,
      };
    }
    const start = extractTime(range.start_time || range.start);
    const end = extractTime(range.end_time || range.end);
    return {
      ...day,
      id: range.id ? String(range.id) : undefined,
      enabled: Boolean(range.id || start || end),
      start_time: start,
      end_time: end,
      time_zone: range.time_zone || DEFAULT_TIME_ZONE,
    };
  });
};

const normalizeServiceIds = (services?: Branch["services"]) => {
  if (!Array.isArray(services)) return [];
  return (services as Array<number | string | { id?: number | string }>)
    .map(s => {
      if (typeof s === "number" || typeof s === "string") return s;
      if (s && typeof s === "object" && "id" in s) return s.id;
      return undefined;
    })
    .filter((id): id is number | string => id !== undefined && id !== null)
    .map(id => String(id));
};

const getEmployeeName = (employee: Employee) =>
  [employee.name, employee.surname].filter(Boolean).join(" ") ||
  employee.name ||
  "Sem nome";

const resolveInitialEmployeeIds = (
  branchData: Branch | null,
  employees: Employee[],
) => {
  const fromBranch = branchData?.employees?.map(e => String(e.id)) ?? [];
  const fromCompany = employees
    .filter(e => e.branches?.some(b => String(b.id) === String(branchData?.id)))
    .map(e => String(e.id));
  return new Set<string>([...fromBranch, ...fromCompany]);
};

const formatPrice = (price?: Service["price"]) => {
  if (price === undefined || price === null || price === "") return null;
  const v = Number(price);
  if (!Number.isFinite(v)) return String(price);
  if (v <= 0) return "Gratuito";
  return `R$ ${v.toFixed(2)}`;
};

const formatDuration = (duration?: Service["duration"]) => {
  if (duration === undefined || duration === null || duration === "")
    return null;
  if (typeof duration === "number") return `${duration} min`;
  const v = Number(duration);
  return Number.isFinite(v) ? `${v} min` : String(duration);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InputWithIcon = ({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      {...props}
      className={cn(
        "h-10 rounded-lg border-border/70 bg-background/70 pl-9 shadow-sm focus-visible:ring-primary/30",
        className,
      )}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BranchDetailPage({
  branchId,
  initialTab = "info",
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    fetchBranchById,
    linkService,
    unlinkService,
    linkEmployeeToBranch,
    unlinkEmployeeFromBranch,
  } = useBranchApi();
  const { company, loading: isCompanyLoading } = useGetCompany();
  const { fetchEmployees } = useEmployeeApi();
  const { getBranchWorkSchedule, createBranchWorkSchedule } =
    useBranchWorkSchedule();
  const { updateWorkRange, deleteWorkRange } = useWorkRange();

  const [tab, setTab] = useState<BranchDetailTab>(initialTab);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isBranchLoading, setIsBranchLoading] = useState(true);

  // ── Info tab state ──
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isImageMarkedForRemoval, setIsImageMarkedForRemoval] = useState(false);

  const { uploadImage, removeImage, isUploading, isRemoving } = useBranchImage({
    branchId,
    currentImage: imageUrl || undefined,
    imageType: "profile",
  });

  const defaultValues = useMemo(() => buildDefaultValues(branch), [branch]);
  const { register, handleSubmit, reset, formState } =
    useForm<BranchEditFormValues>({ defaultValues });

  // ── Schedule tab state ──
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDayState[]>([]);
  const [initialScheduleDays, setInitialScheduleDays] = useState<
    ScheduleDayState[]
  >([]);
  const [isScheduleFetching, setIsScheduleFetching] = useState(false);
  const scheduleTouchedRef = useRef(false);

  // ── Services tab state ──
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [enabledServiceIds, setEnabledServiceIds] = useState<Set<string>>(
    new Set(),
  );
  const [initialServiceIds, setInitialServiceIds] = useState<Set<string>>(
    new Set(),
  );
  const [servicesInitializedFor, setServicesInitializedFor] = useState("");
  const [servicesSearch, setServicesSearch] = useState("");

  // ── Team tab state ──
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(
    new Set(),
  );
  const [initialEmployeeIds, setInitialEmployeeIds] = useState<Set<string>>(
    new Set(),
  );
  const [teamInitializedFor, setTeamInitializedFor] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  // ─── Fetch branch ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!branchId) return;
    let active = true;
    setIsBranchLoading(true);

    fetchBranchById(branchId)
      .then(data => {
        if (!active || !data) return;
        setBranch(data);
        reset(buildDefaultValues(data));
        const img =
          data.design?.images?.profile?.url ||
          data.design?.images?.logo?.url ||
          "";
        setImageUrl(img);
      })
      .finally(() => {
        if (active) setIsBranchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [branchId, fetchBranchById, reset]);

  // ─── Schedule fetch when tab opens ────────────────────────────────────────

  useEffect(() => {
    if (tab !== "schedule" || !branch) return;

    scheduleTouchedRef.current = false;
    const fallback = buildScheduleState(
      branch.work_schedule as ScheduleRange[] | undefined,
    );
    setScheduleDays(fallback);
    setInitialScheduleDays(fallback);

    let cancelled = false;
    setIsScheduleFetching(true);

    getBranchWorkSchedule(branch.id.toString(), { showErrorToast: false })
      .then(ranges => {
        if (cancelled || scheduleTouchedRef.current) return;
        const normalized = buildScheduleState(ranges as ScheduleRange[]);
        setScheduleDays(normalized);
        setInitialScheduleDays(normalized);
      })
      .catch(() => {
        // keep fallback
      })
      .finally(() => {
        if (!cancelled) setIsScheduleFetching(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, branch?.id]);

  // ─── Services init when tab opens ─────────────────────────────────────────

  useEffect(() => {
    if (tab !== "services" || isCompanyLoading || !branchId) return;
    if (servicesInitializedFor === branchId) return;

    const ids = new Set(
      normalizeServiceIds(
        branch?.services ??
          company?.branches?.find(b => String(b.id) === branchId)?.services,
      ),
    );
    setEnabledServiceIds(ids);
    setInitialServiceIds(new Set(ids));
    setServicesInitializedFor(branchId);
  }, [
    tab,
    branchId,
    branch?.services,
    company?.branches,
    isCompanyLoading,
    servicesInitializedFor,
  ]);

  // ─── Team fetch when tab opens ─────────────────────────────────────────────

  useEffect(() => {
    if (tab !== "team") return;
    if (isEmployeesLoading || employees.length > 0) return;

    let active = true;
    setIsEmployeesLoading(true);

    fetchEmployees(1, 200)
      .then(data => {
        if (!active || !data) return;
        setEmployees(data.employees);
      })
      .finally(() => {
        if (active) setIsEmployeesLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== "team" || isEmployeesLoading || !branchId) return;
    if (teamInitializedFor === branchId) return;
    if (employees.length === 0) return;

    const ids = resolveInitialEmployeeIds(branch, employees);
    setSelectedEmployeeIds(ids);
    setInitialEmployeeIds(new Set(ids));
    setTeamInitializedFor(branchId);
  }, [
    tab,
    branchId,
    branch,
    employees,
    isEmployeesLoading,
    teamInitializedFor,
  ]);

  // ─── Info handlers ─────────────────────────────────────────────────────────

  const handleImageClick = () => {
    if (isSavingInfo || isUploading || isRemoving) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(previewUrl);
    setImageUrl(previewUrl);
    setPendingImageFile(file);
    setIsImageMarkedForRemoval(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMarkRemoveImage = () => {
    if (isSavingInfo || isUploading || isRemoving) return;
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setPendingImageFile(null);
    setImageUrl("");
    setIsImageMarkedForRemoval(true);
  };

  const handleSaveInfo = async (values: BranchEditFormValues) => {
    if (!branch) return;
    const hasPendingImage = Boolean(pendingImageFile);
    const hasImageChanges = hasPendingImage || isImageMarkedForRemoval;
    if (!formState.isDirty && !hasImageChanges) return;

    setIsSavingInfo(true);
    try {
      if (hasPendingImage && pendingImageFile) {
        const ok = await uploadImage(pendingImageFile, {
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!ok) throw new Error("Erro ao enviar a imagem da filial.");
        setPendingImageFile(null);
        setIsImageMarkedForRemoval(false);
      } else if (isImageMarkedForRemoval) {
        const ok = await removeImage({
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!ok) throw new Error("Erro ao remover a imagem da filial.");
        setIsImageMarkedForRemoval(false);
      }

      if (formState.isDirty) {
        const response = await fetch(`/api/branch/${branch.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao atualizar filial");
        }
        const updatedBranch = (await response.json()) as Branch;
        setBranch(updatedBranch);
        reset(buildDefaultValues(updatedBranch));
        toast({
          title: "Filial atualizada!",
          description: "Os dados foram salvos com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar alterações",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // ─── Schedule handlers ─────────────────────────────────────────────────────

  const hasScheduleChanges = useMemo(() => {
    if (!scheduleDays.length || !initialScheduleDays.length) return false;
    return scheduleDays.some(day => {
      const initialDay = initialScheduleDays.find(
        d => d.weekday === day.weekday,
      );
      if (!initialDay) return true;
      if (!day.enabled && !initialDay.enabled)
        return day.enabled !== initialDay.enabled;
      return (
        day.enabled !== initialDay.enabled ||
        day.start_time !== initialDay.start_time ||
        day.end_time !== initialDay.end_time ||
        day.time_zone !== initialDay.time_zone
      );
    });
  }, [scheduleDays, initialScheduleDays]);

  const handleToggleDay = (weekday: number, enabled: boolean) => {
    scheduleTouchedRef.current = true;
    setScheduleDays(prev =>
      prev.map(day => {
        if (day.weekday !== weekday) return day;
        if (!enabled) return { ...day, enabled: false };
        return {
          ...day,
          enabled: true,
          start_time: day.start_time || DEFAULT_START_TIME,
          end_time: day.end_time || DEFAULT_END_TIME,
          time_zone: day.time_zone || DEFAULT_TIME_ZONE,
        };
      }),
    );
  };

  const handleTimeChange = (
    weekday: number,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    scheduleTouchedRef.current = true;
    setScheduleDays(prev =>
      prev.map(day =>
        day.weekday === weekday ? { ...day, [field]: value } : day,
      ),
    );
  };

  const applyScheduleChanges = useCallback(
    async (bid: string) => {
      const initialByWeekday = new Map(
        initialScheduleDays.map(d => [d.weekday, d]),
      );
      const rangesToCreate: BranchWorkScheduleRange[] = [];
      const rangesToUpdate: Array<{ id: string; data: ScheduleUpdatePayload }> =
        [];
      const rangesToDelete: string[] = [];

      scheduleDays.forEach(day => {
        const initialDay = initialByWeekday.get(day.weekday);
        const initialId = initialDay?.id;
        const timeZone = day.time_zone || DEFAULT_TIME_ZONE;
        const startTime = day.start_time || DEFAULT_START_TIME;
        const endTime = day.end_time || DEFAULT_END_TIME;

        if (!day.enabled) {
          if (initialId) rangesToDelete.push(initialId);
          return;
        }
        if (initialId) {
          const hasUpdates =
            !initialDay ||
            day.start_time !== initialDay.start_time ||
            day.end_time !== initialDay.end_time ||
            timeZone !== initialDay.time_zone;
          if (hasUpdates)
            rangesToUpdate.push({
              id: initialId,
              data: {
                start_time: startTime,
                end_time: endTime,
                weekday: day.weekday,
                time_zone: timeZone,
              },
            });
          return;
        }
        rangesToCreate.push({
          branch_id: bid,
          weekday: day.weekday,
          start_time: startTime,
          end_time: endTime,
          time_zone: timeZone,
          services: [],
        });
      });

      if (
        rangesToCreate.length === 0 &&
        rangesToUpdate.length === 0 &&
        rangesToDelete.length === 0
      )
        return null;

      if (rangesToCreate.length > 0) {
        await createBranchWorkSchedule(
          bid,
          { branch_work_ranges: rangesToCreate },
          { showSuccessToast: false, showErrorToast: false },
        );
      }
      if (rangesToUpdate.length > 0) {
        await Promise.all(
          rangesToUpdate.map(u =>
            updateWorkRange(bid, u.id, u.data, {
              showSuccessToast: false,
              showErrorToast: false,
            }),
          ),
        );
      }
      if (rangesToDelete.length > 0) {
        await Promise.all(
          rangesToDelete.map(id =>
            deleteWorkRange(bid, id, {
              showSuccessToast: false,
              showErrorToast: false,
            }),
          ),
        );
      }

      const refreshed = await getBranchWorkSchedule(bid, {
        showErrorToast: false,
      });
      const normalized = buildScheduleState(refreshed as ScheduleRange[]);
      setScheduleDays(normalized);
      setInitialScheduleDays(normalized);
      scheduleTouchedRef.current = false;
      return refreshed;
    },
    [
      scheduleDays,
      initialScheduleDays,
      createBranchWorkSchedule,
      updateWorkRange,
      deleteWorkRange,
      getBranchWorkSchedule,
    ],
  );

  const handleSaveSchedule = async () => {
    if (!branch || !hasScheduleChanges) return;
    setIsSavingSchedule(true);
    try {
      const refreshed = await applyScheduleChanges(branch.id.toString());
      if (refreshed)
        setBranch(prev =>
          prev ? { ...prev, work_schedule: refreshed } : prev,
        );
      toast({
        title: "Horários atualizados!",
        description: "Os horários da filial foram salvos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar horários",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os horários.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // ─── Services handlers ─────────────────────────────────────────────────────

  const allServices = useMemo(
    () =>
      Array.isArray(company?.services) ? (company.services as Service[]) : [],
    [company?.services],
  );

  const hasServicesChanges = useMemo(() => {
    if (enabledServiceIds.size !== initialServiceIds.size) return true;
    for (const id of enabledServiceIds)
      if (!initialServiceIds.has(id)) return true;
    return false;
  }, [enabledServiceIds, initialServiceIds]);

  const filteredServices = useMemo(() => {
    const term = servicesSearch.trim().toLowerCase();
    if (!term) return allServices;
    return allServices.filter(s =>
      [s.name, s.category ?? ""].join(" ").toLowerCase().includes(term),
    );
  }, [allServices, servicesSearch]);

  const groupedCategories = useMemo(() => {
    const groups = new Map<string, Service[]>();
    filteredServices.forEach(s => {
      const label =
        (typeof s.category === "string" ? s.category.trim() : "") || "Outros";
      const curr = groups.get(label) ?? [];
      curr.push(s);
      groups.set(label, curr);
    });
    return Array.from(groups.entries());
  }, [filteredServices]);

  const toggleService = (serviceId: string) => {
    setEnabledServiceIds(prev => {
      const next = new Set(prev);
      next.has(serviceId) ? next.delete(serviceId) : next.add(serviceId);
      return next;
    });
  };

  const handleSaveServices = async () => {
    if (!branchId) return;
    const toEnable = allServices
      .filter(
        s =>
          enabledServiceIds.has(String(s.id)) &&
          !initialServiceIds.has(String(s.id)),
      )
      .map(s => s.id);
    const toDisable = allServices
      .filter(
        s =>
          initialServiceIds.has(String(s.id)) &&
          !enabledServiceIds.has(String(s.id)),
      )
      .map(s => s.id);
    if (toEnable.length === 0 && toDisable.length === 0) return;

    setIsSavingServices(true);
    const results = await Promise.allSettled([
      ...toEnable.map(id => linkService(branchId, id)),
      ...toDisable.map(id => unlinkService(branchId, id)),
    ]);
    const failed = results.some(
      r => r.status === "rejected" || r.value === false,
    );

    if (failed) {
      toast({
        title: "Erro ao salvar serviços",
        description: "Nem todas as alterações foram aplicadas.",
        variant: "destructive",
      });
    } else {
      const refreshed = await fetchBranchById(branchId, true);
      if (refreshed) setBranch(refreshed);
      setServicesInitializedFor("");
      setInitialServiceIds(new Set(enabledServiceIds));
    }
    setIsSavingServices(false);
  };

  // ─── Team handlers ─────────────────────────────────────────────────────────

  const hasTeamChanges = useMemo(() => {
    if (selectedEmployeeIds.size !== initialEmployeeIds.size) return true;
    for (const id of selectedEmployeeIds)
      if (!initialEmployeeIds.has(id)) return true;
    return false;
  }, [selectedEmployeeIds, initialEmployeeIds]);

  const filteredEmployees = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter(e =>
      [e.name, e.surname, e.role, e.permission]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [employees, teamSearch]);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      next.has(employeeId) ? next.delete(employeeId) : next.add(employeeId);
      return next;
    });
  };

  const handleSaveTeam = async () => {
    if (!branchId) return;
    const toLink = employees
      .filter(
        e =>
          selectedEmployeeIds.has(String(e.id)) &&
          !initialEmployeeIds.has(String(e.id)),
      )
      .map(e => String(e.id));
    const toUnlink = employees
      .filter(
        e =>
          initialEmployeeIds.has(String(e.id)) &&
          !selectedEmployeeIds.has(String(e.id)),
      )
      .map(e => String(e.id));
    if (toLink.length === 0 && toUnlink.length === 0) return;

    setIsSavingTeam(true);
    const results = await Promise.allSettled([
      ...toLink.map(id => linkEmployeeToBranch(id, branchId)),
      ...toUnlink.map(id => unlinkEmployeeFromBranch(id, branchId)),
    ]);
    const failed = results.some(
      r => r.status === "rejected" || r.value === false,
    );

    if (failed) {
      toast({
        title: "Erro ao salvar equipe",
        description: "Nem todas as alterações foram aplicadas.",
        variant: "destructive",
      });
    } else {
      const refreshed = await fetchBranchById(branchId, true);
      if (refreshed) setBranch(refreshed);
      setTeamInitializedFor("");
      setInitialEmployeeIds(new Set(selectedEmployeeIds));
    }
    setIsSavingTeam(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const branchName = branch?.name ?? "Filial";

  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
          <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/branch")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                {isBranchLoading ? (
                  <Skeleton className="h-7 w-48" />
                ) : (
                  <h1 className="page-title truncate">{branchName}</h1>
                )}
                <p className="text-sm text-muted-foreground">
                  Detalhes da filial
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={v => setTab(v as BranchDetailTab)}>
              <TabsList className="rounded-xl bg-muted/50 p-1">
                <TabsTrigger value="info" className="gap-2 rounded-lg">
                  <Building2 className="h-4 w-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  Horários
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2 rounded-lg">
                  <Sparkles className="h-4 w-4" />
                  Serviços
                </TabsTrigger>
                <TabsTrigger value="team" className="gap-2 rounded-lg">
                  <Users className="h-4 w-4" />
                  Equipe
                </TabsTrigger>
              </TabsList>

              {/* ── Tab: Informações ── */}
              <TabsContent value="info" className="mt-6">
                {isBranchLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(handleSaveInfo)}>
                    <div className="space-y-5">
                      {/* Image */}
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="mb-1 text-sm font-semibold">
                          Imagem da filial
                        </p>
                        <p className="mb-4 text-xs text-muted-foreground">
                          Adicione uma foto para facilitar a identificação.
                        </p>
                        <div className="flex items-center gap-5">
                          <button
                            type="button"
                            className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/15 to-primary/5"
                            onClick={handleImageClick}
                            disabled={isSavingInfo || isUploading || isRemoving}
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={branchName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImagePlus className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
                              <Upload className="h-4 w-4" />
                            </div>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Clique na imagem para selecionar uma nova foto.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleImageClick}
                                disabled={
                                  isSavingInfo || isUploading || isRemoving
                                }
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                {isUploading
                                  ? "Enviando..."
                                  : "Escolher arquivo"}
                              </Button>
                              {imageUrl && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleMarkRemoveImage}
                                  disabled={
                                    isSavingInfo || isUploading || isRemoving
                                  }
                                  className="gap-2 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remover foto
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="mb-4 text-sm font-semibold">
                          Dados da filial
                        </p>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="branch-name">
                              Nome da filial *
                            </Label>
                            <InputWithIcon
                              id="branch-name"
                              placeholder="Ex: Unidade Centro"
                              icon={Building2}
                              {...register("name", { required: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch-street">Rua *</Label>
                            <InputWithIcon
                              id="branch-street"
                              placeholder="Nome da rua"
                              icon={MapPin}
                              {...register("street", { required: true })}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="branch-number">Número *</Label>
                              <InputWithIcon
                                id="branch-number"
                                placeholder="Número"
                                icon={Hash}
                                {...register("number", { required: true })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="branch-complement">
                                Complemento
                              </Label>
                              <InputWithIcon
                                id="branch-complement"
                                placeholder="Apto, sala, etc."
                                icon={Home}
                                {...register("complement")}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="branch-neighborhood">
                                Bairro
                              </Label>
                              <InputWithIcon
                                id="branch-neighborhood"
                                placeholder="Bairro"
                                icon={Navigation}
                                {...register("neighborhood")}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="branch-zip">CEP</Label>
                              <InputWithIcon
                                id="branch-zip"
                                placeholder="00000-000"
                                icon={MapIcon}
                                {...register("zip_code")}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="branch-city">Cidade *</Label>
                              <InputWithIcon
                                id="branch-city"
                                placeholder="Cidade"
                                icon={MapPin}
                                {...register("city", { required: true })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="branch-state">Estado *</Label>
                              <InputWithIcon
                                id="branch-state"
                                placeholder="UF"
                                icon={MapIcon}
                                {...register("state", { required: true })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch-country">País</Label>
                            <InputWithIcon
                              id="branch-country"
                              placeholder="Brasil"
                              icon={Globe}
                              {...register("country")}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="btn-gradient"
                          disabled={isSavingInfo || isUploading || isRemoving}
                        >
                          {isSavingInfo ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* ── Tab: Horários ── */}
              <TabsContent value="schedule" className="mt-6">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="mb-1 text-sm font-semibold">
                    Horários de funcionamento
                  </p>
                  <p className="mb-5 text-xs text-muted-foreground">
                    Configure os dias e horários de atendimento desta filial.
                  </p>

                  {isScheduleFetching ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scheduleDays.map(day => (
                        <div
                          key={day.weekday}
                          className={cn(
                            "flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center",
                            day.enabled
                              ? "border-primary/20 bg-primary/5"
                              : "border-border bg-muted/20",
                          )}
                        >
                          <div className="flex w-36 flex-shrink-0 items-center gap-3">
                            <Switch
                              checked={day.enabled}
                              onCheckedChange={checked =>
                                handleToggleDay(day.weekday, checked)
                              }
                              disabled={isSavingSchedule}
                            />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                day.enabled
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {day.label}
                            </span>
                          </div>
                          {day.enabled && (
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  De
                                </span>
                                <Input
                                  type="time"
                                  value={day.start_time}
                                  onChange={e =>
                                    handleTimeChange(
                                      day.weekday,
                                      "start_time",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 w-28 text-sm"
                                  disabled={isSavingSchedule}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  às
                                </span>
                                <Input
                                  type="time"
                                  value={day.end_time}
                                  onChange={e =>
                                    handleTimeChange(
                                      day.weekday,
                                      "end_time",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 w-28 text-sm"
                                  disabled={isSavingSchedule}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end border-t border-border pt-4">
                    <Button
                      className="btn-gradient"
                      onClick={handleSaveSchedule}
                      disabled={
                        !hasScheduleChanges ||
                        isSavingSchedule ||
                        isScheduleFetching
                      }
                    >
                      {isSavingSchedule ? "Salvando..." : "Salvar horários"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── Tab: Serviços ── */}
              <TabsContent value="services" className="mt-6">
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar serviços..."
                        value={servicesSearch}
                        onChange={e => setServicesSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEnabledServiceIds(
                            new Set(allServices.map(s => String(s.id))),
                          )
                        }
                        disabled={isSavingServices || isCompanyLoading}
                      >
                        <Check className="mr-1.5 h-4 w-4" />
                        Todos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEnabledServiceIds(new Set())}
                        disabled={isSavingServices || isCompanyLoading}
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        Nenhum
                      </Button>
                    </div>
                  </div>

                  {isCompanyLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : groupedCategories.length === 0 ? (
                    <div className="rounded-xl border bg-card p-6 text-muted-foreground">
                      Nenhum serviço encontrado.
                    </div>
                  ) : (
                    groupedCategories.map(([category, catServices]) => (
                      <div key={category} className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          {category}
                        </h2>
                        <div className="grid gap-3">
                          {catServices.map(service => {
                            const sid = String(service.id);
                            const isEnabled = enabledServiceIds.has(sid);
                            return (
                              <div
                                key={sid}
                                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex items-center gap-4">
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={() => toggleService(sid)}
                                    disabled={isSavingServices}
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {service.name}
                                    </p>
                                    {(formatPrice(service.price) ||
                                      formatDuration(service.duration)) && (
                                      <p className="text-sm text-muted-foreground">
                                        {[
                                          formatPrice(service.price),
                                          formatDuration(service.duration),
                                        ]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant={isEnabled ? "default" : "secondary"}
                                >
                                  {isEnabled ? "Ativo" : "Inativo"}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex justify-end border-t border-border pt-4">
                    <Button
                      className="btn-gradient"
                      onClick={handleSaveServices}
                      disabled={
                        !hasServicesChanges ||
                        isSavingServices ||
                        isCompanyLoading
                      }
                    >
                      {isSavingServices ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── Tab: Equipe ── */}
              <TabsContent value="team" className="mt-6">
                <div className="space-y-5">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar profissionais..."
                      value={teamSearch}
                      onChange={e => setTeamSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl border bg-card px-4 py-3">
                      <span className="text-2xl font-bold text-primary">
                        {isEmployeesLoading ? "-" : selectedEmployeeIds.size}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        nesta filial
                      </span>
                    </div>
                    <div className="rounded-xl border bg-card px-4 py-3">
                      <span className="text-2xl font-bold">
                        {isEmployeesLoading ? "-" : employees.length}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        total
                      </span>
                    </div>
                  </div>

                  {isEmployeesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="rounded-xl border bg-card p-6 text-muted-foreground">
                      Nenhum profissional encontrado.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {filteredEmployees.map(employee => {
                        const isEnabled = selectedEmployeeIds.has(
                          String(employee.id),
                        );
                        return (
                          <div
                            key={employee.id}
                            className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() =>
                                  toggleEmployee(String(employee.id))
                                }
                                disabled={isSavingTeam}
                              />
                              <UserAvatar
                                name={employee.name}
                                surname={employee.surname}
                                imageUrl={
                                  employee.meta?.design?.images?.profile?.url
                                }
                                size="md"
                                className="flex-shrink-0"
                              />
                              <div>
                                <p className="font-medium">
                                  {getEmployeeName(employee)}
                                </p>
                                {(employee.role || employee.permission) && (
                                  <p className="text-sm text-muted-foreground">
                                    {employee.role || employee.permission}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={isEnabled ? "default" : "secondary"}
                            >
                              {isEnabled ? "Nesta filial" : "Não vinculado"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end border-t border-border pt-4">
                    <Button
                      className="btn-gradient"
                      onClick={handleSaveTeam}
                      disabled={
                        !hasTeamChanges || isSavingTeam || isEmployeesLoading
                      }
                    >
                      {isSavingTeam ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
