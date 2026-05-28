"use client";

import { useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchSettings, updateSettings } from "@/hooks/inventory/use-inventory-api";
import type { InventorySettings } from "@/types/inventory";

const settingsSchema = z.object({
  default_finish_shortage_policy: z.enum([
    "block_finish",
    "create_pending",
    "allow_negative",
  ]),
  booking_block_policy: z.enum([
    "block_create_and_reschedule",
    "block_finish_only",
    "block_public_only",
  ]),
  reservation_policy: z.enum([
    "reserve_on_approval",
    "reserve_on_confirmation",
    "no_reservation",
  ]),
  expiration_alert_days_default: z.coerce.number().int().min(0),
  auto_resolve_alerts: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const shortageLabels: Record<string, string> = {
  block_finish: "Bloquear conclusão do serviço",
  create_pending: "Criar pendência de estoque",
  allow_negative: "Permitir estoque negativo",
};

const bookingLabels: Record<string, string> = {
  block_create_and_reschedule: "Bloquear criação e reagendamento",
  block_finish_only: "Bloquear somente conclusão",
  block_public_only: "Bloquear somente agendamentos públicos",
};

export function SettingsTab() {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      default_finish_shortage_policy: "block_finish",
      booking_block_policy: "block_finish_only",
      reservation_policy: "no_reservation",
      expiration_alert_days_default: 30,
      auto_resolve_alerts: false,
    },
  });

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSettings();
      setSettings(data);
      form.reset({
        default_finish_shortage_policy: data.default_finish_shortage_policy,
        booking_block_policy: data.booking_block_policy,
        reservation_policy: data.reservation_policy,
        expiration_alert_days_default: data.expiration_alert_days_default,
        auto_resolve_alerts: data.auto_resolve_alerts,
      });
    } catch {
      toast({
        title: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      const updated = await updateSettings(data);
      setSettings(updated);
      toast({ title: "Configurações salvas com sucesso." });
    } catch {
      toast({
        title: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Não foi possível carregar as configurações.</p>
        <Button variant="outline" onClick={() => void loadSettings()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-6"
      >
        <FormField
          control={form.control}
          name="default_finish_shortage_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Política de falta de estoque</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(shortageLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="booking_block_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Política de bloqueio de agendamentos</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(bookingLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reservation_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Política de reserva de estoque</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="reserve_on_approval">Reservar ao aprovar agendamento</SelectItem>
                  <SelectItem value="reserve_on_confirmation">Reservar ao confirmar agendamento</SelectItem>
                  <SelectItem value="no_reservation">Sem reserva automática</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiration_alert_days_default"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dias padrão para alerta de vencimento</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="auto_resolve_alerts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Resolver alertas automaticamente</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </form>
    </Form>
  );
}
