// ── Inventory Types ──────────────────────────────────────────────────────────
// Mirroring Go DTOs from mynute-go-core/core/src/config/api/dto/inventory.go

// ── Units ────────────────────────────────────────────────────────────────────

export interface InventoryUnit {
  id: string;
  code: string;
  name: string;
  symbol: string;
  dimension: string;
  factor_to_base: number;
  base_unit_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryUnitList {
  units: InventoryUnit[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateInventoryUnit {
  code: string;
  name: string;
  symbol: string;
  dimension: string;
  factor_to_base: number;
  base_unit_id?: string | null;
  is_active?: boolean;
}

// ── Locations ────────────────────────────────────────────────────────────────

export interface InventoryLocation {
  id: string;
  branch_id: string;
  name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLocationList {
  locations: InventoryLocation[];
  total: number;
  page: number;
  page_size: number;
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  base_unit_id: string;
  unit_cost: number; // int64 cents
  track_batch: boolean;
  track_serial: boolean;
  allow_fractional: boolean;
  min_quantity: number;
  min_stock_value: number; // int64 cents
  expiration_alert_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryProductList {
  products: InventoryProduct[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateInventoryProduct {
  name: string;
  sku: string;
  description?: string;
  base_unit_id: string;
  unit_cost: number;
  track_batch: boolean;
  track_serial: boolean;
  allow_fractional: boolean;
  min_quantity: number;
  min_stock_value: number;
  expiration_alert_days: number;
  is_active?: boolean;
}

export interface UpdateInventoryProduct {
  name?: string;
  description?: string;
  unit_cost?: number;
  track_batch?: boolean;
  track_serial?: boolean;
  allow_fractional?: boolean;
  min_quantity?: number;
  min_stock_value?: number;
  expiration_alert_days?: number;
  is_active?: boolean;
}

// ── Balance ───────────────────────────────────────────────────────────────────

export interface InventoryBalance {
  id: string;
  product_id: string;
  location_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  average_unit_cost: number; // int64 cents
  stock_value: number; // int64 cents
  last_movement_id: string | null;
  updated_at: string;
}

export interface InventoryBalanceList {
  balances: InventoryBalance[];
  total: number;
  page: number;
  page_size: number;
}

// ── Movements ────────────────────────────────────────────────────────────────

export type MovementType =
  | "initial"
  | "purchase"
  | "adjustment_in"
  | "adjustment_out"
  | "reservation"
  | "reservation_release"
  | "consumption"
  | "return"
  | "negative_consumption";

export interface InventoryMovement {
  id: string;
  product_id: string;
  location_id: string;
  batch_id: string | null;
  serial_id: string | null;
  appointment_id: string | null;
  service_id: string | null;
  movement_type: MovementType;
  quantity: number;
  unit_id: string;
  unit_cost: number; // int64 cents
  total_cost: number; // int64 cents
  reason: string;
  reference: string;
  created_by_employee_id: string | null;
  created_at: string;
}

export interface InventoryMovementList {
  movements: InventoryMovement[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateInventoryMovement {
  product_id: string;
  location_id: string;
  batch_id?: string | null;
  serial_id?: string | null;
  movement_type: MovementType;
  quantity: number;
  unit_id: string;
  unit_cost: number;
  reason?: string;
  reference?: string;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export type FinishShortagePolicy =
  | "block_finish"
  | "create_pending"
  | "allow_negative";

export type BookingBlockPolicy =
  | "block_create_and_reschedule"
  | "block_finish_only"
  | "block_public_only";

export interface InventorySettings {
  id: string;
  default_finish_shortage_policy: FinishShortagePolicy;
  booking_block_policy: BookingBlockPolicy;
  reservation_policy: "reserve_on_approval" | "reserve_on_confirmation" | "no_reservation";
  expiration_alert_days_default: number;
  auto_resolve_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateInventorySettings {
  default_finish_shortage_policy?: FinishShortagePolicy;
  booking_block_policy?: BookingBlockPolicy;
  reservation_policy?: "reserve_on_approval" | "reserve_on_confirmation" | "no_reservation";
  expiration_alert_days_default?: number;
  auto_resolve_alerts?: boolean;
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "open" | "resolved" | "ignored";

export interface InventoryAlert {
  id: string;
  rule_id: string | null;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  product_id: string | null;
  location_id: string | null;
  batch_id: string | null;
  serial_id: string | null;
  message: string;
  triggered_at: string;
  resolved_at: string | null;
  ignored_at: string | null;
  created_at: string;
}

export interface InventoryAlertList {
  alerts: InventoryAlert[];
  total: number;
  page: number;
  page_size: number;
}

// ── Service Inventory Items ───────────────────────────────────────────────────

export interface ServiceInventoryItem {
  id: string;
  service_id: string;
  product_id: string;
  product_name: string;
  unit_id: string;
  unit_symbol: string;
  unit_cost_cents: number;
  default_quantity: number;
  is_required: boolean;
  notes: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceInventoryItemList {
  items: ServiceInventoryItem[];
  total: number;
}

export interface CreateServiceInventoryItem {
  product_id: string;
  unit_id: string;
  default_quantity: number;
  is_required: boolean;
  notes?: string;
}

export interface UpdateServiceInventoryItem {
  default_quantity?: number;
  is_required?: boolean;
  notes?: string;
}

// ── Appointment Inventory Usages ─────────────────────────────────────────────

export type UsageStatus =
  | "planned"
  | "reserved"
  | "consumed"
  | "pending_stock"
  | "skipped"
  | "cancelled";

export interface AppointmentInventoryUsage {
  id: string;
  appointment_id: string;
  service_inventory_item_id?: string | null;
  product_id: string;
  product_name?: string | null;
  location_id: string;
  batch_id: string | null;
  serial_id: string | null;
  movement_id: string | null;
  planned_quantity: number;
  actual_quantity: number | null;
  unit_id: string;
  unit_symbol?: string | null;
  unit_cost: number;
  total_cost: number;
  source: "service_default" | "ad_hoc";
  status: UsageStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentInventoryUsageList {
  items: AppointmentInventoryUsage[];
}

// ── Finalize Appointment ─────────────────────────────────────────────────────

// FinalizeUsageItem mirrors Go FinalizeAppointmentUsageItem:
// usage_id is the AppointmentInventoryUsage record ID.
export interface FinalizeUsageItem {
  usage_id: string;
  actual_quantity: number;
  batch_id?: string | null;
  serial_id?: string | null;
  notes?: string;
}

export interface FinalizeAppointmentRequest {
  shortage_policy_override?: FinishShortagePolicy | null;
  items: FinalizeUsageItem[];
}

export interface FinalizeAppointmentResponse {
  appointment_id: string;
  is_fulfilled: boolean;
  items: AppointmentInventoryUsage[];
}
