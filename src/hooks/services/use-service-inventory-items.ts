import { useState, useCallback } from "react";
import type {
  ServiceInventoryItem,
  CreateServiceInventoryItem,
} from "@/types/inventory";

export function useServiceInventoryItems(serviceId: string) {
  const [items, setItems] = useState<ServiceInventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/service/${serviceId}/inventory-items`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao buscar itens de inventário");
      }
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const addItem = async (data: CreateServiceInventoryItem) => {
    const res = await fetch(`/api/service/${serviceId}/inventory-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      const msg = err.message || "Erro ao adicionar item";
      setError(msg);
      throw new Error(msg);
    }
    const created: ServiceInventoryItem = await res.json();
    setItems(prev => [...prev, created]);
    setTotal(prev => prev + 1);
    return created;
  };

  const deleteItem = async (itemId: string) => {
    const res = await fetch(
      `/api/service/${serviceId}/inventory-items/${itemId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const err = await res.json();
      const msg = err.message || "Erro ao remover item";
      setError(msg);
      throw new Error(msg);
    }
    setItems(prev => prev.filter(i => i.id !== itemId));
    setTotal(prev => Math.max(0, prev - 1));
  };

  return { items, total, loading, error, fetchItems, addItem, deleteItem };
}
