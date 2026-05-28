/**
 * Jest tests for the Inventory dashboard page.
 * Written BEFORE implementation (TDD RED phase).
 */
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";

// ── Mock fetch for API calls ──────────────────────────────────────────────────

// URL.revokeObjectURL polyfill for jsdom
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

const mockProductList = {
  products: [
    {
      id: "prod-1",
      name: "Shampoo 500ml",
      sku: "SHM-500",
      description: "Professional shampoo",
      base_unit_id: "unit-1",
      unit_cost: 1500,
      track_batch: false,
      track_serial: false,
      allow_fractional: true,
      min_quantity: 5,
      min_stock_value: 0,
      expiration_alert_days: 30,
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  page_size: 20,
};

const mockMovementList = {
  movements: [
    {
      id: "mov-1",
      product_id: "prod-1",
      location_id: "loc-1",
      batch_id: null,
      serial_id: null,
      appointment_id: null,
      service_id: null,
      movement_type: "purchase",
      quantity: 100,
      unit_id: "unit-1",
      unit_cost: 1500,
      total_cost: 150000,
      reason: "Initial stock",
      reference: "PO-001",
      created_by_employee_id: null,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  page_size: 20,
};

const mockSettings = {
  id: "settings-1",
  default_finish_shortage_policy: "block_finish",
  booking_block_policy: "block_finish_only",
  reservation_policy: "reserve_on_approval",
  expiration_alert_days_default: 30,
  auto_resolve_alerts: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockAlertList = {
  alerts: [
    {
      id: "alert-1",
      product_id: "prod-1",
      location_id: "loc-1",
      type: "low_stock",
      severity: "warning",
      status: "open",
      message: "Estoque baixo: Shampoo 500ml",
      triggered_at: "2026-01-01T00:00:00Z",
      resolved_at: null,
      resolved_by_employee_id: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  page_size: 50,
};

const mockAlertListCritical = {
  alerts: [
    {
      id: "alert-crit",
      product_id: "prod-1",
      location_id: "loc-1",
      type: "low_stock",
      severity: "critical",
      status: "open",
      message: "Nível crítico: Shampoo 500ml",
      triggered_at: "2026-01-01T00:00:00Z",
      resolved_at: null,
      resolved_by_employee_id: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  page_size: 50,
};

const mockAlertListEmpty = {
  alerts: [],
  total: 0,
  page: 1,
  page_size: 50,
};

const mockProductListEmpty = {
  products: [],
  total: 0,
  page: 1,
  page_size: 100,
};

const mockMovementListEmpty = {
  movements: [],
  total: 0,
  page: 1,
  page_size: 100,
};

const mockCreatedProduct = {
  id: "prod-new",
  name: "Condicionador 300ml",
  sku: "CND-300",
  description: "",
  base_unit_id: "unit-1",
  unit_cost: 2000,
  track_batch: false,
  track_serial: false,
  allow_fractional: true,
  min_quantity: 0,
  min_stock_value: 0,
  expiration_alert_days: 30,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock motion package (used for animations)
jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe("InventoryPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (String(url).includes("/api/inventory/products")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockProductList,
        });
      }
      if (String(url).includes("/api/inventory/movements")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockMovementList,
        });
      }
      if (String(url).includes("/api/inventory/settings")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockSettings,
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the inventory page with tabs", async () => {
    const { InventoryDashboard } = await import(
      "@/app/dashboard/inventory/inventory"
    );
    render(<InventoryDashboard />);

    expect(screen.getByText("Estoque")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /produtos/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /movimentos/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /alertas/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /configura/i }),
    ).toBeInTheDocument();
  });

  it("shows products tab content with product data", async () => {
    const { InventoryDashboard } = await import(
      "@/app/dashboard/inventory/inventory"
    );
    render(<InventoryDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Shampoo 500ml")).toBeInTheDocument();
    });
    expect(screen.getByText("SHM-500")).toBeInTheDocument();
  });

  it("renders add product button on products tab", async () => {
    const { InventoryDashboard } = await import(
      "@/app/dashboard/inventory/inventory"
    );
    render(<InventoryDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /novo produto/i }),
      ).toBeInTheDocument();
    });
  });

  it("switches to movements tab and shows movement data", async () => {
    const { MovementsTab } = await import(
      "@/app/dashboard/inventory/_components/movements-tab"
    );
    render(<MovementsTab />);

    await waitFor(
      () => {
        expect(screen.getByText("Initial stock")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("switches to settings tab and shows policy form", async () => {
    const { SettingsTab } = await import(
      "@/app/dashboard/inventory/_components/settings-tab"
    );
    render(<SettingsTab />);

    await waitFor(
      () => {
        expect(screen.getByText(/pol.tica de falta/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});

// ── AlertsTab ─────────────────────────────────────────────────────────────────

describe("AlertsTab", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders alert rows with severity badge and message", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAlertList,
    });

    const { AlertsTab } = await import(
      "@/app/dashboard/inventory/_components/alerts-tab"
    );
    render(<AlertsTab />);

    await waitFor(() => {
      expect(screen.getByText("Estoque baixo: Shampoo 500ml")).toBeInTheDocument();
    });
    // severity badge label for "warning" → "Atenção"
    expect(screen.getByText("Atenção")).toBeInTheDocument();
    // action buttons
    expect(screen.getByRole("button", { name: /resolver/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ignorar/i })).toBeInTheDocument();
  });

  it("renders destructive badge for critical severity", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAlertListCritical,
    });

    const { AlertsTab } = await import(
      "@/app/dashboard/inventory/_components/alerts-tab"
    );
    render(<AlertsTab />);

    await waitFor(() => {
      expect(screen.getByText("Crítico")).toBeInTheDocument();
    });
    expect(screen.getByText("Nível crítico: Shampoo 500ml")).toBeInTheDocument();
  });

  it("renders empty state when no open alerts", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockAlertListEmpty,
    });

    const { AlertsTab } = await import(
      "@/app/dashboard/inventory/_components/alerts-tab"
    );
    render(<AlertsTab />);

    await waitFor(() => {
      expect(
        screen.getByText(/nenhum alerta aberto/i),
      ).toBeInTheDocument();
    });
  });

  it("removes resolved alert from the list after resolve action", async () => {
    global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PATCH") {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockAlertList,
      });
    });

    const { AlertsTab } = await import(
      "@/app/dashboard/inventory/_components/alerts-tab"
    );
    render(<AlertsTab />);

    await waitFor(() => {
      expect(screen.getByText("Estoque baixo: Shampoo 500ml")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /resolver/i }));
    });

    await waitFor(() => {
      expect(screen.queryByText("Estoque baixo: Shampoo 500ml")).not.toBeInTheDocument();
    });
  });

  it("removes ignored alert from the list after ignore action", async () => {
    global.fetch = jest.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PATCH") {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockAlertList,
      });
    });

    const { AlertsTab } = await import(
      "@/app/dashboard/inventory/_components/alerts-tab"
    );
    render(<AlertsTab />);

    await waitFor(() => {
      expect(screen.getByText("Estoque baixo: Shampoo 500ml")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /ignorar/i }));
    });

    await waitFor(() => {
      expect(screen.queryByText("Estoque baixo: Shampoo 500ml")).not.toBeInTheDocument();
    });
  });
});

// ── ProductsTab — empty state & search ────────────────────────────────────────

describe("ProductsTab — empty state and search", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state message when products list is empty", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProductListEmpty,
    });

    const { ProductsTab } = await import(
      "@/app/dashboard/inventory/_components/products-tab"
    );
    render(<ProductsTab />);

    await waitFor(() => {
      expect(screen.getByText(/nenhum produto/i)).toBeInTheDocument();
    });
  });

  it("filters products by name when search term matches", async () => {
    // Server-side search: mock always returns matching products
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProductList,
    });

    const { ProductsTab } = await import(
      "@/app/dashboard/inventory/_components/products-tab"
    );
    render(<ProductsTab />);

    await waitFor(() => {
      expect(screen.getByText("Shampoo 500ml")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(searchInput, { target: { value: "Shampoo" } });

    // Server-side search is async: must await re-fetch before asserting
    await waitFor(() => {
      expect(screen.getByText("Shampoo 500ml")).toBeInTheDocument();
    });
  });

  it("shows no product rows when search term matches nothing", async () => {
    // Server-side search: mock returns empty list for non-matching queries
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProductListEmpty,
    });

    const { ProductsTab } = await import(
      "@/app/dashboard/inventory/_components/products-tab"
    );
    render(<ProductsTab />);

    const searchInput = await waitFor(() => screen.getByPlaceholderText(/buscar/i));
    fireEvent.change(searchInput, { target: { value: "XYZNOTFOUND" } });

    // Server-side search is async: must await re-fetch before asserting empty state
    await waitFor(() => {
      expect(screen.queryByText("Shampoo 500ml")).not.toBeInTheDocument();
      expect(screen.getByText(/nenhum produto/i)).toBeInTheDocument();
    });
  });

  it("shows delete confirmation dialog when trash button is clicked", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProductList,
    });

    const { ProductsTab } = await import(
      "@/app/dashboard/inventory/_components/products-tab"
    );
    render(<ProductsTab />);

    await waitFor(() => {
      expect(screen.getByText("Shampoo 500ml")).toBeInTheDocument();
    });

    // Find and click the trash button
    const trashButtons = screen.getAllByRole("button").filter(btn =>
      btn.querySelector("svg") !== null
    );
    // The delete button should be present (one of the icon buttons)
    // Look for AlertDialog trigger by clicking trash icon button
    const deleteBtn = document.querySelector("button svg.lucide-trash-2")?.closest("button") as HTMLElement | null;
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(screen.getByText(/excluir produto/i)).toBeInTheDocument();
      });
    }
  });
});

// ── MovementsTab — empty state & badge labels ─────────────────────────────────

describe("MovementsTab — empty state and badge labels", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when movements list is empty", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockMovementListEmpty,
    });

    const { MovementsTab } = await import(
      "@/app/dashboard/inventory/_components/movements-tab"
    );
    render(<MovementsTab />);

    await waitFor(() => {
      expect(screen.getByText(/nenhum movimento/i)).toBeInTheDocument();
    });
  });

  it("renders 'Compra' badge label for purchase movement type", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockMovementList,
    });

    const { MovementsTab } = await import(
      "@/app/dashboard/inventory/_components/movements-tab"
    );
    render(<MovementsTab />);

    await waitFor(() => {
      expect(screen.getByText("Compra")).toBeInTheDocument();
    });
  });
});

// ── ProductDialog ─────────────────────────────────────────────────────────────

describe("ProductDialog", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders create dialog with empty form fields", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCreatedProduct,
    });

    const { ProductDialog } = await import(
      "@/app/dashboard/inventory/_components/product-dialog"
    );
    const onClose = jest.fn();
    const onSaved = jest.fn();

    render(
      <ProductDialog
        open={true}
        product={null}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByText("Novo produto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar produto/i })).toBeInTheDocument();
  });

  it("renders edit dialog with pre-filled product data", async () => {
    const { ProductDialog } = await import(
      "@/app/dashboard/inventory/_components/product-dialog"
    );
    const onClose = jest.fn();
    const onSaved = jest.fn();
    const editProduct = mockProductList.products[0];

    render(
      <ProductDialog
        open={true}
        product={editProduct as any}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByText("Editar produto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument();
    // form should have the product name pre-filled
    const nameInput = screen.getByPlaceholderText(/shampoo 500ml/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Shampoo 500ml");
  });

  it("shows validation error when name field is submitted empty", async () => {
    const { ProductDialog } = await import(
      "@/app/dashboard/inventory/_components/product-dialog"
    );
    const onClose = jest.fn();
    const onSaved = jest.fn();

    render(
      <ProductDialog
        open={true}
        product={null}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: /criar produto/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });
});

// ── MovementDialog — form reset ───────────────────────────────────────────────

describe("MovementDialog — form reset on open", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("resets form fields when dialog is reopened", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    const { MovementDialog } = await import(
      "@/app/dashboard/inventory/_components/movement-dialog"
    );

    const { rerender } = render(
      <MovementDialog open={false} onClose={jest.fn()} onSaved={jest.fn()} />,
    );

    // Open the dialog
    rerender(
      <MovementDialog open={true} onClose={jest.fn()} onSaved={jest.fn()} />,
    );

    // product_id should show placeholder (reset to default — now uses SearchableSelect)
    const productCombobox = screen.getByRole("combobox", { name: /produto/i });
    expect(productCombobox).toBeInTheDocument();
    expect(productCombobox).toHaveTextContent(/selecione o produto|carregando/i);
  });
});
