/**
 * Jest tests for service inventory items hook and UI.
 * Written BEFORE implementation (TDD RED phase).
 */

import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

// URL.revokeObjectURL polyfill for jsdom
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

import {
  mockServiceInventoryItems,
  mockServiceInventoryItemsResponse,
  MOCK_IDS,
  MOCK_INVENTORY_IDS,
} from "@/mocks/data";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const mockInventoryToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockInventoryToast }),
}));

// ── useServiceInventoryItems hook tests ───────────────────────────────────────

describe("useServiceInventoryItems", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it("fetches items for a service and updates state", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServiceInventoryItemsResponse,
    });

    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() =>
      useServiceInventoryItems(MOCK_IDS.service1),
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].product_name).toBe(
      "Shampoo Profissional 500ml",
    );
    expect(result.current.items[0].unit_cost_cents).toBe(1500);
    expect(result.current.total).toBe(2);
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/service/${MOCK_IDS.service1}/inventory-items`,
    );
  });

  it("sets error state on fetch failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Não encontrado" }),
    });

    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() =>
      useServiceInventoryItems(MOCK_IDS.service1),
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    expect(result.current.error).toBe("Não encontrado");
    expect(result.current.items).toHaveLength(0);
  });

  it("adds an item and updates the items list", async () => {
    const newItem = {
      ...mockServiceInventoryItems[0],
      id: "new-item-id",
      product_name: "Produto Novo",
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServiceInventoryItemsResponse,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => newItem,
    });

    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() =>
      useServiceInventoryItems(MOCK_IDS.service1),
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    await act(async () => {
      await result.current.addItem({
        product_id: MOCK_INVENTORY_IDS.product1,
        unit_id: MOCK_INVENTORY_IDS.unit1,
        default_quantity: 10,
        is_required: false,
      });
    });

    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[2].product_name).toBe("Produto Novo");
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/service/${MOCK_IDS.service1}/inventory-items`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws and does not update state on addItem failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServiceInventoryItemsResponse,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Produto não encontrado" }),
    });

    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() =>
      useServiceInventoryItems(MOCK_IDS.service1),
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    await expect(
      act(async () => {
        await result.current.addItem({
          product_id: "nonexistent",
          unit_id: MOCK_INVENTORY_IDS.unit1,
          default_quantity: 1,
        });
      }),
    ).rejects.toThrow("Produto não encontrado");

    expect(result.current.items).toHaveLength(2); // unchanged
  });

  it("deletes an item and removes it from the list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServiceInventoryItemsResponse,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() =>
      useServiceInventoryItems(MOCK_IDS.service1),
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    await act(async () => {
      await result.current.deleteItem(MOCK_INVENTORY_IDS.serviceItem1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(
      result.current.items.find(
        i => i.id === MOCK_INVENTORY_IDS.serviceItem1,
      ),
    ).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/service/${MOCK_IDS.service1}/inventory-items/${MOCK_INVENTORY_IDS.serviceItem1}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("does nothing when serviceId is empty", async () => {
    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() => useServiceInventoryItems(""));

    await act(async () => {
      await result.current.fetchItems();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.items).toHaveLength(0);
  });

  it("throws and does not update state on deleteItem failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServiceInventoryItemsResponse,
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Falha ao remover" }),
    });

    const { useServiceInventoryItems } = await import(
      "@/hooks/services/use-service-inventory-items"
    );
    const { result } = renderHook(() =>
      useServiceInventoryItems(MOCK_IDS.service1),
    );

    await act(async () => {
      await result.current.fetchItems();
    });

    await expect(
      act(async () => {
        await result.current.deleteItem(MOCK_INVENTORY_IDS.serviceItem1);
      }),
    ).rejects.toThrow("Falha ao remover");

    expect(result.current.items).toHaveLength(2); // unchanged
  });
});

// ── ServiceCard cost display tests ────────────────────────────────────────────

describe("ServiceCard — inventory cost display", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays 'Insumos: R$ X,XX' after fetching items", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockServiceInventoryItemsResponse,
    });

    const ServiceCard = (await import("@/app/dashboard/services/service-card"))
      .default;

    await act(async () => {
      render(
        <ServiceCard
          serviceId={MOCK_IDS.service1}
          name="Corte de Cabelo"
          duration="60 min"
          price="R$ 85,00"
        />,
      );
    });

    // cost = 1500 * 50 + 2000 * 30 = 75000 + 60000 = 135000 cents = R$ 1.350,00
    await waitFor(() => {
      expect(screen.getByText("Insumos: R$ 1.350,00")).toBeInTheDocument();
    });
  });

  it("displays 'Sem insumos' when no items exist", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    });

    const ServiceCard = (await import("@/app/dashboard/services/service-card"))
      .default;

    await act(async () => {
      render(
        <ServiceCard
          serviceId={MOCK_IDS.service1}
          name="Corte de Cabelo"
          duration="60 min"
          price="R$ 85,00"
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/sem insumos/i)).toBeInTheDocument();
    });
  });
});
