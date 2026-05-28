"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  createMovement,
  fetchProducts,
  fetchUnits,
  fetchLocations,
} from "@/hooks/inventory/use-inventory-api";
import type {
  InventoryProduct,
  InventoryUnit,
  InventoryLocation,
} from "@/types/inventory";
import { SearchableSelect } from "./searchable-select";

const movementSchema = z.object({
  product_id: z.string().min(1, "Produto é obrigatório"),
  location_id: z.string().min(1, "Local é obrigatório"),
  movement_type: z.enum([
    "initial",
    "purchase",
    "adjustment_in",
    "adjustment_out",
    "return",
  ]),
  quantity: z.coerce.number().min(0.001, "Quantidade deve ser maior que zero"),
  unit_id: z.string().min(1, "Unidade é obrigatória"),
  unit_cost: z.coerce.number().int().min(0),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const movementTypeOptions = [
  { value: "initial", label: "Estoque inicial" },
  { value: "purchase", label: "Compra" },
  { value: "adjustment_in", label: "Ajuste de entrada (+)" },
  { value: "adjustment_out", label: "Ajuste de saída (–)" },
  { value: "return", label: "Devolução" },
];

const defaultValues: MovementFormData = {
  product_id: "",
  location_id: "",
  movement_type: "purchase",
  quantity: 1,
  unit_id: "",
  unit_cost: 0,
  reason: "",
  reference: "",
};

export function MovementDialog({ open, onClose, onSaved }: MovementDialogProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues,
  });

  // Load reference data when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setDataLoading(true);
    Promise.all([
      fetchProducts({ page: 1, page_size: 100, is_active: true }),
      fetchUnits({ page: 1, page_size: 100, is_active: true }),
      fetchLocations({ page: 1, page_size: 100, is_active: true }),
    ])
      .then(([prod, unit, loc]) => {
        if (cancelled) return;
        setProducts(prod.products ?? []);
        setUnits(unit.units ?? []);
        setLocations(loc.locations ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        toast({
          title: "Erro ao carregar dados do formulário",
          description: "Não foi possível carregar produtos, unidades ou locais. Tente novamente.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, form]);

  const onSubmit = async (data: MovementFormData) => {
    try {
      await createMovement({
        product_id: data.product_id,
        location_id: data.location_id,
        movement_type: data.movement_type,
        quantity: data.quantity,
        unit_id: data.unit_id,
        unit_cost: data.unit_cost,
        reason: data.reason,
        reference: data.reference,
      });
      toast({ title: "Movimento registrado com sucesso." });
      form.reset(defaultValues);
      onSaved();
      onClose();
    } catch {
      toast({
        title: "Erro ao registrar movimento",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar movimento manual</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="movement-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                      placeholder={dataLoading ? "Carregando..." : "Selecione o produto"}
                      searchPlaceholder="Buscar produto..."
                      disabled={dataLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                      placeholder={dataLoading ? "Carregando..." : "Selecione o local"}
                      searchPlaceholder="Buscar local..."
                      disabled={dataLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de movimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {movementTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.001" {...field} />
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
                    <FormLabel>Custo unit. (centavos)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={units.map(unit => ({ value: unit.id, label: `${unit.name} (${unit.symbol})` }))}
                      placeholder={dataLoading ? "Carregando..." : "Selecione a unidade"}
                      searchPlaceholder="Buscar unidade..."
                      disabled={dataLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra de fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="movement-form">
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
