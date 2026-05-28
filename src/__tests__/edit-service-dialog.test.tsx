/**
 * Jest tests for EditServiceDialog — error handling in inventory operations.
 * Isolated in own file to allow module-level mocks without polluting
 * the hook-level tests in service-inventory.test.tsx.
 */

import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import React from "react";
import { MOCK_IDS, MOCK_INVENTORY_IDS } from "@/mocks/data";

// ── Polyfills ────────────────────────────────────────────────────────────────

if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

// ── Module-level mocks ───────────────────────────────────────────────────────

const mockToast = jest.fn();
const mockUpdateService = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/hooks/services/use-edit-service", () => ({
  useEditService: () => ({ isUpdating: false, updateService: mockUpdateService }),
}));

jest.mock("@/hooks/services/use-service-image", () => ({
  useServiceImage: () => ({ uploadImage: jest.fn() }),
}));

jest.mock("@/hooks/services/use-get-service", () => ({
  useGetService: () => ({ service: null }),
}));

// Controlled mock state for useServiceInventoryItems
const mockInventoryHook = {
  items: [] as {
    id: string;
    product_name: string;
    unit_symbol: string;
    default_quantity: number;
    unit_cost_cents: number;
    is_required: boolean;
  }[],
  total: 0,
  loading: false,
  error: null as string | null,
  fetchItems: jest.fn(),
  addItem: jest.fn(),
  deleteItem: jest.fn(),
};

jest.mock("@/hooks/services/use-service-inventory-items", () => ({
  useServiceInventoryItems: () => mockInventoryHook,
}));

// ── Test helpers ─────────────────────────────────────────────────────────────

const mockService = {
  id: MOCK_IDS.service1,
  name: "Corte",
  description: "Descrição do serviço",
  duration: 60,
  price: 8500,
  isActive: true,
  imageUrl: null,
  createdAt: "2024-01-01T00:00:00Z",
};

async function renderDialog() {
  const { EditServiceDialog } = await import(
    "@/app/dashboard/services/edit-service-dialog"
  );
  await act(async () => {
    render(
      <EditServiceDialog
        isOpen={true}
        onOpenChange={jest.fn()}
        service={mockService as Parameters<typeof EditServiceDialog>[0]["service"]}
        onSave={jest.fn()}
      />,
    );
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("EditServiceDialog — inventory error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInventoryHook.items = [];
    mockInventoryHook.total = 0;
    mockInventoryHook.error = null;
    mockInventoryHook.fetchItems.mockResolvedValue(undefined);
    mockInventoryHook.addItem.mockResolvedValue(undefined);
    mockInventoryHook.deleteItem.mockResolvedValue(undefined);
    mockUpdateService.mockResolvedValue(null);
  });

  it("shows the delete button when inventory items exist", async () => {
    mockInventoryHook.items = [
      {
        id: MOCK_INVENTORY_IDS.serviceItem1,
        product_name: "Shampoo",
        unit_symbol: "ml",
        default_quantity: 50,
        unit_cost_cents: 1500,
        is_required: true,
      },
    ];
    mockInventoryHook.total = 1;

    await renderDialog();

    await waitFor(() => {
      expect(screen.getByText("Shampoo")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /remover insumo/i })).toBeInTheDocument();
  });

  it("shows error toast when deleteItem throws", async () => {
    mockInventoryHook.items = [
      {
        id: MOCK_INVENTORY_IDS.serviceItem1,
        product_name: "Shampoo",
        unit_symbol: "ml",
        default_quantity: 50,
        unit_cost_cents: 1500,
        is_required: true,
      },
    ];
    mockInventoryHook.total = 1;
    mockInventoryHook.deleteItem.mockRejectedValueOnce(new Error("Falha ao remover"));

    await renderDialog();

    await waitFor(() => {
      expect(screen.getByText("Shampoo")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /remover insumo/i });
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao remover insumo",
          variant: "destructive",
        }),
      );
    });
  });

  it("shows error toast when updateService throws during form submit", async () => {
    mockUpdateService.mockRejectedValueOnce(new Error("Servidor indisponível"));

    await renderDialog();

    // Submit the form with the existing values
    const submitButton = screen.getByRole("button", { name: /salvar/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao atualizar serviço",
          variant: "destructive",
        }),
      );
    });
  });

  it("shows error toast when addItem throws", async () => {
    mockInventoryHook.addItem.mockRejectedValueOnce(new Error("Produto inválido"));

    await renderDialog();

    // Fill in the add-item form fields (placeholders defined in edit-service-dialog.tsx)
    const productIdInput = screen.getByPlaceholderText("ID do produto");
    const unitIdInput = screen.getByPlaceholderText("ID da unidade");
    const qtyInput = screen.getByPlaceholderText("Qtd");

    fireEvent.change(productIdInput, { target: { value: "prod-001" } });
    fireEvent.change(unitIdInput, { target: { value: "unit-001" } });
    fireEvent.change(qtyInput, { target: { value: "5" } });

    const addButton = screen.getByRole("button", { name: /adicionar/i });
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao adicionar insumo",
          variant: "destructive",
        }),
      );
    });
  });
});
