"use client";

import type {
  InventoryProductList,
  InventoryProduct,
  CreateInventoryProduct,
  UpdateInventoryProduct,
  InventoryMovementList,
  CreateInventoryMovement,
  InventoryBalanceList,
  InventorySettings,
  UpdateInventorySettings,
  InventoryAlertList,
  InventoryUnitList,
  InventoryLocationList,
} from "@/types/inventory";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erro ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface FetchProductsOptions {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

export async function fetchProducts(
  options: FetchProductsOptions = {},
): Promise<InventoryProductList> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  if (options.search) params.set("search", options.search);
  if (options.is_active !== undefined)
    params.set("is_active", String(options.is_active));

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryProductList>(`/api/inventory/products${query}`);
}

export async function createProduct(
  data: CreateInventoryProduct,
): Promise<InventoryProduct> {
  return apiFetch<InventoryProduct>("/api/inventory/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: UpdateInventoryProduct,
): Promise<InventoryProduct> {
  return apiFetch<InventoryProduct>(`/api/inventory/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<unknown>(`/api/inventory/products/${id}`, {
    method: "DELETE",
  });
}

// ── Movements ─────────────────────────────────────────────────────────────────

export interface FetchMovementsOptions {
  page?: number;
  page_size?: number;
  product_id?: string;
  location_id?: string;
  movement_type?: string;
}

export async function fetchMovements(
  options: FetchMovementsOptions = {},
): Promise<InventoryMovementList> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  if (options.product_id) params.set("product_id", options.product_id);
  if (options.location_id) params.set("location_id", options.location_id);
  if (options.movement_type) params.set("movement_type", options.movement_type);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryMovementList>(`/api/inventory/movements${query}`);
}

export async function createMovement(
  data: CreateInventoryMovement,
): Promise<void> {
  await apiFetch<unknown>("/api/inventory/movements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Balance ────────────────────────────────────────────────────────────────────

export interface FetchBalanceOptions {
  page?: number;
  page_size?: number;
  product_id?: string;
  location_id?: string;
}

export async function fetchBalance(
  options: FetchBalanceOptions = {},
): Promise<InventoryBalanceList> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  if (options.product_id) params.set("product_id", options.product_id);
  if (options.location_id) params.set("location_id", options.location_id);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryBalanceList>(`/api/inventory/balance${query}`);
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<InventorySettings> {
  return apiFetch<InventorySettings>("/api/inventory/settings");
}

export async function updateSettings(
  data: UpdateInventorySettings,
): Promise<InventorySettings> {
  return apiFetch<InventorySettings>("/api/inventory/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export interface FetchAlertsOptions {
  page?: number;
  page_size?: number;
  status?: string;
  severity?: string;
  product_id?: string;
}

export async function fetchAlerts(
  options: FetchAlertsOptions = {},
): Promise<InventoryAlertList> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  if (options.status) params.set("status", options.status);
  if (options.severity) params.set("severity", options.severity);
  if (options.product_id) params.set("product_id", options.product_id);

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryAlertList>(`/api/inventory/alerts${query}`);
}

export async function resolveAlert(id: string): Promise<void> {
  await apiFetch<unknown>(`/api/inventory/alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "resolved" }),
  });
}

export async function ignoreAlert(id: string): Promise<void> {
  await apiFetch<unknown>(`/api/inventory/alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "ignored" }),
  });
}

// ── Units ─────────────────────────────────────────────────────────────────────

export interface FetchUnitsOptions {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

export async function fetchUnits(
  options: FetchUnitsOptions = {},
): Promise<InventoryUnitList> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  if (options.is_active !== undefined)
    params.set("is_active", String(options.is_active));

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryUnitList>(`/api/inventory/units${query}`);
}

// ── Locations ─────────────────────────────────────────────────────────────────

export interface FetchLocationsOptions {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

export async function fetchLocations(
  options: FetchLocationsOptions = {},
): Promise<InventoryLocationList> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.page_size) params.set("page_size", String(options.page_size));
  if (options.is_active !== undefined)
    params.set("is_active", String(options.is_active));

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<InventoryLocationList>(`/api/inventory/locations${query}`);
}
