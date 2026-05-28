"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  createProduct,
  updateProduct,
  fetchUnits,
} from "@/hooks/inventory/use-inventory-api";
import type { InventoryProduct, InventoryUnit } from "@/types/inventory";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  description: z.string().optional(),
  base_unit_id: z.string().min(1, "Unidade base é obrigatória"),
  unit_cost: z.coerce.number().int().min(0, "Custo deve ser >= 0"),
  track_batch: z.boolean(),
  track_serial: z.boolean(),
  allow_fractional: z.boolean(),
  min_quantity: z.coerce.number().min(0),
  min_stock_value: z.coerce.number().int().min(0),
  expiration_alert_days: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  product: InventoryProduct | null;
  onClose: () => void;
  onSaved: (product: InventoryProduct) => void;
}

const defaultValues: ProductFormData = {
  name: "",
  sku: "",
  description: "",
  base_unit_id: "",
  unit_cost: 0,
  track_batch: false,
  track_serial: false,
  allow_fractional: true,
  min_quantity: 0,
  min_stock_value: 0,
  expiration_alert_days: 30,
  is_active: true,
};

export function ProductDialog({
  open,
  product,
  onClose,
  onSaved,
}: ProductDialogProps) {
  const { toast } = useToast();
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setUnitsLoading(true);
    fetchUnits({ page: 1, page_size: 100, is_active: true })
      .then(res => {
        if (!cancelled) setUnits(res.units ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setUnits([]);
        toast({
          title: "Erro ao carregar unidades",
          description: "Não foi possível carregar a lista de unidades. Tente reabrir o diálogo.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setUnitsLoading(false);
      });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (open && product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        description: product.description ?? "",
        base_unit_id: product.base_unit_id,
        unit_cost: product.unit_cost,
        track_batch: product.track_batch,
        track_serial: product.track_serial,
        allow_fractional: product.allow_fractional,
        min_quantity: product.min_quantity,
        min_stock_value: product.min_stock_value,
        expiration_alert_days: product.expiration_alert_days,
        is_active: product.is_active,
      });
    } else if (open) {
      form.reset(defaultValues);
    }
  }, [open, product, form]);

  const isEditing = product !== null;

  const onSubmit = async (data: ProductFormData) => {
    try {
      let saved: InventoryProduct;
      if (product !== null) {
        saved = await updateProduct(product.id, {
          name: data.name,
          description: data.description,
          unit_cost: data.unit_cost,
          track_batch: data.track_batch,
          track_serial: data.track_serial,
          allow_fractional: data.allow_fractional,
          min_quantity: data.min_quantity,
          min_stock_value: data.min_stock_value,
          expiration_alert_days: data.expiration_alert_days,
          is_active: data.is_active,
        });
      } else {
        saved = await createProduct({
          name: data.name,
          sku: data.sku,
          description: data.description,
          base_unit_id: data.base_unit_id,
          unit_cost: data.unit_cost,
          track_batch: data.track_batch,
          track_serial: data.track_serial,
          allow_fractional: data.allow_fractional,
          min_quantity: data.min_quantity,
          min_stock_value: data.min_stock_value,
          expiration_alert_days: data.expiration_alert_days,
          is_active: data.is_active ?? true,
        });
      }
      toast({
        title: isEditing ? "Produto atualizado." : "Produto criado.",
      });
      onSaved(saved);
      onClose();
    } catch {
      toast({
        title: isEditing
          ? "Erro ao atualizar produto"
          : "Erro ao criar produto",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar produto" : "Novo produto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="product-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Shampoo 500ml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SHM-500"
                        disabled={isEditing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo unitário (centavos)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_unit_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Unidade base</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditing || unitsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              unitsLoading ? "Carregando..." : "Selecione a unidade"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.symbol})
                          </SelectItem>
                        ))}
                        {units.length === 0 && !unitsLoading && (
                          <SelectItem value="__empty__" disabled>
                            Nenhuma unidade disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque mínimo (qtd)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor mínimo (centavos)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiration_alert_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alerta vencimento (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              {(
                [
                  { name: "allow_fractional", label: "Permitir fracionamento" },
                  { name: "track_batch", label: "Rastrear lotes" },
                  { name: "track_serial", label: "Rastrear números de série" },
                  { name: "is_active", label: "Produto ativo" },
                ] as const
              ).map(item => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel className="text-sm">{item.label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form">
            {isEditing ? "Salvar alterações" : "Criar produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
