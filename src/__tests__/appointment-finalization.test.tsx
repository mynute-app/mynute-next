/**
 * Jest tests for appointment inventory usages, finalize hook, and finalization dialog.
 * Written BEFORE implementation (TDD RED phase).
 */

import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { renderHook } from "@testing-library/react";

// URL.revokeObjectURL polyfill for jsdom
if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}

// Pointer capture polyfills required by Radix Select in jsdom
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

import {
  mockAppointmentInventoryUsages,
  mockAppointmentInventoryUsagesResponse,
  mockFinalizeResponse,
  mockUsageWithTrackBatch,
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

const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// ── useAppointmentInventoryUsages hook tests ──────────────────────────────────

describe("useAppointmentInventoryUsages", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it("fetches usages for an appointment and updates state", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAppointmentInventoryUsagesResponse,
    });

    const { useAppointmentInventoryUsages } = await import(
      "@/hooks/appointment/use-appointment-inventory-usages"
    );
    const { result } = renderHook(() =>
      useAppointmentInventoryUsages(MOCK_IDS.appointment1),
    );

    await act(async () => {
      await result.current.fetchUsages();
    });

    expect(result.current.usages).toHaveLength(2);
    expect(result.current.usages[0].product_name).toBe(
      "Shampoo Profissional 500ml",
    );
    expect(result.current.usages[0].status).toBe("reserved");
    expect(result.current.usages[1].status).toBe("planned");
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/appointment/${MOCK_IDS.appointment1}/inventory-usages`,
    );
  });

  it("sets error state on fetch failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Acesso negado" }),
    });

    const { useAppointmentInventoryUsages } = await import(
      "@/hooks/appointment/use-appointment-inventory-usages"
    );
    const { result } = renderHook(() =>
      useAppointmentInventoryUsages(MOCK_IDS.appointment1),
    );

    await act(async () => {
      await result.current.fetchUsages();
    });

    expect(result.current.error).toBe("Acesso negado");
    expect(result.current.usages).toHaveLength(0);
  });

  it("does nothing when appointmentId is empty", async () => {
    const { useAppointmentInventoryUsages } = await import(
      "@/hooks/appointment/use-appointment-inventory-usages"
    );
    const { result } = renderHook(() =>
      useAppointmentInventoryUsages(""),
    );

    await act(async () => {
      await result.current.fetchUsages();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ── useFinalizeAppointment hook tests ─────────────────────────────────────────

describe("useFinalizeAppointment", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it("sends PATCH request and returns the finalized response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFinalizeResponse,
    });

    const { useFinalizeAppointment } = await import(
      "@/hooks/appointment/use-finalize-appointment"
    );
    const { result } = renderHook(() => useFinalizeAppointment());

    // Payload must match FinalizeUsageItem (Go backend): usage_id + actual_quantity
    const usagePayload = [
      {
        usage_id: MOCK_INVENTORY_IDS.usage1,
        actual_quantity: 50,
        batch_id: "batch-abc-001",
      },
      {
        usage_id: MOCK_INVENTORY_IDS.usage2,
        actual_quantity: 30,
      },
    ];

    let response: typeof mockFinalizeResponse | undefined;
    await act(async () => {
      response = await result.current.finalizeAppointment(
        MOCK_IDS.appointment1,
        { items: usagePayload },
      );
    });

    expect(response?.is_fulfilled).toBe(true);
    expect(response?.appointment_id).toBe(MOCK_IDS.appointment1);
    expect(response?.items).toHaveLength(2);
    expect(response?.items[0].status).toBe("consumed");

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/appointment/${MOCK_IDS.appointment1}/finalize`,
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }),
    );

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body,
    );
    // Backend expects items[] with usage_id (NOT usages[] with product_id)
    expect(callBody.items[0].usage_id).toBe(MOCK_INVENTORY_IDS.usage1);
    expect(callBody.items[0].actual_quantity).toBe(50);
    expect(callBody.items[0].batch_id).toBe("batch-abc-001");
    expect(callBody.items[1].usage_id).toBe(MOCK_INVENTORY_IDS.usage2);
    expect(callBody.items[1].actual_quantity).toBe(30);
  });

  it("sets error and re-throws on finalize failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Estoque insuficiente" }),
    });

    const { useFinalizeAppointment } = await import(
      "@/hooks/appointment/use-finalize-appointment"
    );
    const { result } = renderHook(() => useFinalizeAppointment());

    // React 19: when act() rejects, state updates scheduled inside the async
    // fn() may not be flushed before assertions run (multiple microtask
    // boundaries from mocked fetch). Fix: catch inside act() so it resolves,
    // then React flushes all state before assertions.
    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.finalizeAppointment(MOCK_IDS.appointment1, {
          items: [],
        });
      } catch (e) {
        thrownError = e as Error;
      }
    });

    expect(thrownError?.message).toBe("Estoque insuficiente");
    expect(result.current.error).toBe("Estoque insuficiente");
  });

  it("sends shortage_policy_override when provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFinalizeResponse,
    });

    const { useFinalizeAppointment } = await import(
      "@/hooks/appointment/use-finalize-appointment"
    );
    const { result } = renderHook(() => useFinalizeAppointment());

    await act(async () => {
      await result.current.finalizeAppointment(MOCK_IDS.appointment1, {
        items: [],
        shortage_policy_override: "allow_negative",
      });
    });

    const callBody = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body,
    );
    expect(callBody.shortage_policy_override).toBe("allow_negative");
  });
  it("sets error and re-throws on network failure (fetch rejects)", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { useFinalizeAppointment } = await import(
      "@/hooks/appointment/use-finalize-appointment"
    );
    const { result } = renderHook(() => useFinalizeAppointment());

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.finalizeAppointment(MOCK_IDS.appointment1, {
          items: [],
        });
      } catch (e) {
        thrownError = e as Error;
      }
    });

    expect(thrownError?.message).toBe("Network error");
    expect(result.current.error).toBe("Network error");
  });
});

// ── AppointmentFinalizationDialog tests ──────────────────────────────────────

describe("AppointmentFinalizationDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders usages list when opened", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAppointmentInventoryUsagesResponse,
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Shampoo Profissional 500ml"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Condicionador Hidratante 300ml"),
      ).toBeInTheDocument();
    });
  });

  it("shows batch_id select (combobox) for usage with track_batch=true", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [mockUsageWithTrackBatch] }),
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      // track_batch=true → a Select (labeled "Lote") must appear for the user to pick a batch
      const batchSelect = screen.getByLabelText(/lote/i);
      expect(batchSelect).toBeInTheDocument();
      expect(batchSelect).toHaveAttribute('role', 'combobox');
      // The old free-text Input must NOT be rendered
      expect(
        screen.queryByPlaceholderText(/id do lote/i),
      ).not.toBeInTheDocument();
    });
  });

  it("does NOT show batch_id input for usages with track_batch=false", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAppointmentInventoryUsagesResponse,
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      // Both usages have track_batch=false → no element labeled "Lote" should exist
      expect(screen.queryByLabelText(/lote/i)).not.toBeInTheDocument();
      // No serial inputs (both usages have track_serial=false)
      const serialInputs = screen.queryAllByPlaceholderText(/número de série/i);
      expect(serialInputs).toHaveLength(0);
    });
  });

  it("shows empty state when no active usages", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/nenhum produto de estoque planejado/i),
      ).toBeInTheDocument();
    });
  });

  it("sends items[] with usage_id (not usages[] with product_id) on submit", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentInventoryUsagesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinalizeResponse,
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Shampoo Profissional 500ml")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      // Second fetch is the PATCH /finalize
      const patchCall = (global.fetch as jest.Mock).mock.calls[1];
      const callBody = JSON.parse(patchCall[1].body);
      // Backend expects items[] with usage_id — NOT usages[] with product_id
      expect(callBody.items).toBeDefined();
      expect(callBody.usages).toBeUndefined();
      expect(callBody.items[0].usage_id).toBe(MOCK_INVENTORY_IDS.usage1);
      expect(callBody.items[0].actual_quantity).toBe(50);
      expect(callBody.items[1].usage_id).toBe(MOCK_INVENTORY_IDS.usage2);
      expect(callBody.items[1].actual_quantity).toBe(30);
    });
  });

  it("sends updated actual_quantity when user edits the quantity input", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentInventoryUsagesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinalizeResponse,
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    // Wait for usages to load
    await waitFor(() => {
      expect(screen.getByText("Shampoo Profissional 500ml")).toBeInTheDocument();
    });

    // Change actual_quantity for usage1 (the first qty input)
    const qtyInputs = screen.getAllByLabelText(/quantidade real/i);
    await act(async () => {
      fireEvent.change(qtyInputs[0], { target: { value: "25" } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls[1];
      const callBody = JSON.parse(patchCall[1].body);
      // Must reflect the edited value (25), not the original planned (50)
      expect(callBody.items[0].actual_quantity).toBe(25);
    });
  });

  it("shows error toast when finalization fails", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentInventoryUsagesResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Estoque insuficiente" }),
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Shampoo Profissional 500ml")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro ao finalizar",
          variant: "destructive",
        }),
      );
    });
  });

  it("calls onFinalized after successful submission", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentInventoryUsagesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinalizeResponse,
      });

    const onFinalized = jest.fn();
    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={onFinalized}
        />,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Shampoo Profissional 500ml"),
      ).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      expect(onFinalized).toHaveBeenCalledWith(
        expect.objectContaining({ is_fulfilled: true }),
      );
    });
  });

  it("does NOT show batch_id input when track_batch is false (Go omitempty absent field)", async () => {
    const omitemptyUsage = {
      ...mockAppointmentInventoryUsages[0],
      batch_id: undefined as unknown as null,
      serial_id: undefined as unknown as null,
      track_batch: false,
      track_serial: false,
    };
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [omitemptyUsage] }),
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      // When batch_id is undefined (Go omitempty absent field), Select (labeled Lote) must NOT render
      expect(screen.queryByLabelText(/lote/i)).not.toBeInTheDocument();
      const serialInputs = screen.queryAllByPlaceholderText(/número de série/i);
      expect(serialInputs).toHaveLength(0);
    });
  });

  it("clamps negative actual_quantity to 0 in submitted payload", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentInventoryUsagesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinalizeResponse,
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Shampoo Profissional 500ml")).toBeInTheDocument();
    });

    // Enter a negative value for the first usage
    const qtyInputs = screen.getAllByLabelText(/quantidade real/i);
    await act(async () => {
      fireEvent.change(qtyInputs[0], { target: { value: "-10" } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls[1];
      const callBody = JSON.parse(patchCall[1].body);
      // Negative quantity must be clamped to 0
      expect(callBody.items[0].actual_quantity).toBe(0);
    });
  });

  it("shows serial_id input for usage with track_serial=true", async () => {
    const usageWithSerial = {
      ...mockUsageWithTrackBatch,
      id: "usage-serial-test",
      product_name: "Produto com Série",
      track_batch: false,
      track_serial: true,
    };
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [usageWithSerial] }),
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      // track_serial=true → serial input must appear
      const serialInput = screen.getByPlaceholderText(/número de série/i);
      expect(serialInput).toBeInTheDocument();
      // no batch Select since track_batch=false
      expect(screen.queryByLabelText(/lote/i)).not.toBeInTheDocument();
    });
  });

  it("blocks submit and shows error toast when track_batch=true and batch_id is empty", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [mockUsageWithTrackBatch] }),
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Produto com Lote")).toBeInTheDocument();
    });

    // Submit without filling batch_id (field is visible but empty)
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/lote/i),
          variant: "destructive",
        }),
      );
      // PATCH (finalize) request must NOT be sent — only GETs (usages + batches)
      const patchCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (call: unknown[]) =>
          typeof call[1] === "object" &&
          (call[1] as RequestInit).method === "PATCH",
      );
      expect(patchCalls).toHaveLength(0);
    });
  });

  it("skips batch_id validation when actual_quantity is 0 (C1)", async () => {
    // When qty=0, the item is skipped — batch_id should NOT be required
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [mockUsageWithTrackBatch] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ batches: [], total: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          appointment_id: MOCK_IDS.appointment1,
          is_fulfilled: true,
          items: [],
        }),
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );
    const onFinalized = jest.fn();

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={onFinalized}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Produto com Lote")).toBeInTheDocument();
    });

    // Set actual_quantity to 0
    const qtyInput = screen.getByLabelText(/quantidade real/i);
    await act(async () => {
      fireEvent.change(qtyInput, { target: { value: "0" } });
    });

    // Submit without selecting batch — should succeed because qty=0
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /finalizar atendimento/i }),
      );
    });

    await waitFor(() => {
      // No destructive toast — batch validation is skipped for qty=0
      const destructiveCalls = mockToast.mock.calls.filter(
        (args: unknown[]) =>
          (args[0] as { variant?: string })?.variant === "destructive",
      );
      expect(destructiveCalls).toHaveLength(0);
      // Finalize callback was triggered
      expect(onFinalized).toHaveBeenCalledWith(
        expect.objectContaining({ is_fulfilled: true }),
      );
    });
  });

  it("verifies fetchBatches is called with correct product_id and shows batch select trigger (C2)", async () => {
    const mockBatchId = "batch-uuid-001";
    const mockBatchCode = "LOTE-2026-01";

    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [mockUsageWithTrackBatch] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          batches: [
            {
              id: mockBatchId,
              product_id: mockUsageWithTrackBatch.product_id,
              location_id: "loc-001",
              batch_code: mockBatchCode,
              quantity_on_hand: 100,
              quantity_reserved: 5,
              unit_cost: 500,
              expires_at: null,
              status: "active",
            },
          ],
          total: 1,
        }),
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Produto com Lote")).toBeInTheDocument();
    });

    // Verify that fetchBatches was called for the right product
    await waitFor(() => {
      const batchesFetchCall = (global.fetch as jest.Mock).mock.calls.find(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).includes("/api/inventory/batches"),
      );
      expect(batchesFetchCall).toBeDefined();
      expect(batchesFetchCall![0]).toContain(
        `product_id=${mockUsageWithTrackBatch.product_id}`,
      );
    });

    // Verify the batch select trigger (labeled "Lote") is present
    const batchSelect = screen.getByLabelText(/lote/i);
    expect(batchSelect).toBeInTheDocument();
  });

  it("blocks submit and shows error toast when track_serial=true and serial_id is empty", async () => {
    const usageWithSerial = {
      ...mockUsageWithTrackBatch,
      id: "usage-serial-val-test",
      product_name: "Produto com Série",
      track_batch: false,
      track_serial: true,
    };
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [usageWithSerial] }),
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Produto com Série")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/série/i),
          variant: "destructive",
        }),
      );
      expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1);
    });
  });

  it("renders charged amount and payment method fields", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAppointmentInventoryUsagesResponse,
    });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/valor cobrado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/forma de pagamento/i)).toBeInTheDocument();
    });
  });

  it("sends charged_amount when provided", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAppointmentInventoryUsagesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinalizeResponse,
      });

    const { AppointmentFinalizationDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-finalization-dialog"
    );

    await act(async () => {
      render(
        <AppointmentFinalizationDialog
          appointmentId={MOCK_IDS.appointment1}
          open={true}
          onOpenChange={() => {}}
          onFinalized={() => {}}
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Shampoo Profissional 500ml")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/valor cobrado/i), {
        target: { value: "75.50" },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /finalizar atendimento/i }));
    });

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(patchCall[1].body);
      expect(body.charged_amount).toBe(7550);
      expect(body.payment_method).toBeUndefined();
    });
  });
});

// ── AppointmentDetailsDialog — Finalizar button ───────────────────────────────

describe("AppointmentDetailsDialog — Finalizar button", () => {
  const baseProps = {
    clientInfo: [],
    serviceInfo: [],
    employeeInfo: [],
    companyEmployees: [],
    open: true,
    onOpenChange: jest.fn(),
    onAppointmentDeleted: jest.fn(),
    onAppointmentApproved: jest.fn(),
    onAppointmentFinalized: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Finalizar button when not cancelled, not fulfilled, and approved by employee", async () => {
    const { AppointmentDetailsDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-details-dialog"
    );

    const appointment = {
      id: MOCK_IDS.appointment1,
      service_id: MOCK_IDS.service1,
      employee_id: MOCK_IDS.employee1,
      client_id: MOCK_IDS.client1,
      branch_id: MOCK_IDS.branch1,
      company_id: MOCK_IDS.company,
      payment_id: "",
      cancelled_employee_id: "",
      start_time: "2026-06-01 10:00:00",
      end_time: "2026-06-01 11:00:00",
      time_zone: "America/Sao_Paulo",
      rescheduled: false,
      cancelled: false,
      cancel_time: "",
      is_fulfilled: false,
      is_cancelled: false,
      is_cancelled_by_client: false,
      is_cancelled_by_employee: false,
      is_confirmed_by_client: true,
      is_approved_by_employee: true, // approved → Finalizar must show
      history: { field_changes: null },
      comments: null,
    };

    render(<AppointmentDetailsDialog {...baseProps} appointment={appointment} />);

    expect(screen.getByRole("button", { name: /finalizar/i })).toBeInTheDocument();
  });

  it("does NOT show Finalizar button when already fulfilled", async () => {
    const { AppointmentDetailsDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-details-dialog"
    );

    const appointment = {
      id: MOCK_IDS.appointment1,
      service_id: MOCK_IDS.service1,
      employee_id: MOCK_IDS.employee1,
      client_id: MOCK_IDS.client1,
      branch_id: MOCK_IDS.branch1,
      company_id: MOCK_IDS.company,
      payment_id: "",
      cancelled_employee_id: "",
      start_time: "2026-06-01 10:00:00",
      end_time: "2026-06-01 11:00:00",
      time_zone: "America/Sao_Paulo",
      rescheduled: false,
      cancelled: false,
      cancel_time: "",
      is_fulfilled: true, // already fulfilled → no Finalizar
      is_cancelled: false,
      is_cancelled_by_client: false,
      is_cancelled_by_employee: false,
      is_confirmed_by_client: true,
      is_approved_by_employee: true,
      history: { field_changes: null },
      comments: null,
    };

    render(<AppointmentDetailsDialog {...baseProps} appointment={appointment} />);

    expect(
      screen.queryByRole("button", { name: /finalizar/i }),
    ).not.toBeInTheDocument();
  });

  it("does NOT show Finalizar button when not approved by employee", async () => {
    const { AppointmentDetailsDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-details-dialog"
    );

    const appointment = {
      id: MOCK_IDS.appointment1,
      service_id: MOCK_IDS.service1,
      employee_id: MOCK_IDS.employee1,
      client_id: MOCK_IDS.client1,
      branch_id: MOCK_IDS.branch1,
      company_id: MOCK_IDS.company,
      payment_id: "",
      cancelled_employee_id: "",
      start_time: "2026-06-01 10:00:00",
      end_time: "2026-06-01 11:00:00",
      time_zone: "America/Sao_Paulo",
      rescheduled: false,
      cancelled: false,
      cancel_time: "",
      is_fulfilled: false,
      is_cancelled: false,
      is_cancelled_by_client: false,
      is_cancelled_by_employee: false,
      is_confirmed_by_client: true,
      is_approved_by_employee: false, // not approved → no Finalizar
      history: { field_changes: null },
      comments: null,
    };

    render(<AppointmentDetailsDialog {...baseProps} appointment={appointment} />);

    expect(
      screen.queryByRole("button", { name: /finalizar/i }),
    ).not.toBeInTheDocument();
  });

  it("does NOT show Finalizar button when cancelled", async () => {
    const { AppointmentDetailsDialog } = await import(
      "@/app/dashboard/scheduling/view/_components/appointment-details-dialog"
    );

    const appointment = {
      id: MOCK_IDS.appointment1,
      service_id: MOCK_IDS.service1,
      employee_id: MOCK_IDS.employee1,
      client_id: MOCK_IDS.client1,
      branch_id: MOCK_IDS.branch1,
      company_id: MOCK_IDS.company,
      payment_id: "",
      cancelled_employee_id: "",
      start_time: "2026-06-01 10:00:00",
      end_time: "2026-06-01 11:00:00",
      time_zone: "America/Sao_Paulo",
      rescheduled: false,
      cancelled: true, // cancelled → no Finalizar
      cancel_time: "2026-06-01T09:00:00Z",
      is_fulfilled: false,
      is_cancelled: true,
      is_cancelled_by_client: false,
      is_cancelled_by_employee: false,
      is_confirmed_by_client: true,
      is_approved_by_employee: true,
      history: { field_changes: null },
      comments: null,
    };

    render(<AppointmentDetailsDialog {...baseProps} appointment={appointment} />);

    expect(
      screen.queryByRole("button", { name: /finalizar/i }),
    ).not.toBeInTheDocument();
  });
});

// ── BackendHttpError (Aud3) ───────────────────────────────────────────────────

describe("BackendHttpError", () => {
  it("preserves status code and message", async () => {
    const { BackendHttpError } = await import(
      "@/lib/api/fetch-from-backend"
    );
    const error = new BackendHttpError(422, "Estoque insuficiente");
    expect(error.status).toBe(422);
    expect(error.message).toBe("Estoque insuficiente");
    expect(error.name).toBe("BackendHttpError");
    expect(error instanceof Error).toBe(true);
  });

  it("fetchFromBackend throws BackendHttpError with correct status on non-401 error", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: () => null },
      text: async () => "Estoque insuficiente",
    }) as unknown as typeof fetch;

    try {
      const { fetchFromBackend, BackendHttpError } = await import(
        "@/lib/api/fetch-from-backend"
      );
      const mockReq = {} as any;

      let caughtError: unknown;
      try {
        await fetchFromBackend(mockReq, "/test-endpoint", "token-123", {
          skipCompanyContext: true,
        });
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(BackendHttpError);
      expect((caughtError as InstanceType<typeof BackendHttpError>).status).toBe(422);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
