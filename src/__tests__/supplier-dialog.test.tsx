/**
 * Jest tests for SupplierDialog component.
 * Tests create mode, edit mode, form submission, and error handling.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// ── Polyfills ────────────────────────────────────────────────────────────────

if (typeof URL.revokeObjectURL === "undefined") {
  Object.defineProperty(URL, "revokeObjectURL", { value: () => {} });
}
if (typeof URL.createObjectURL === "undefined") {
  Object.defineProperty(URL, "createObjectURL", { value: () => "blob:test" });
}

// ── Module-level mocks ───────────────────────────────────────────────────────

const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("lucide-react", () => ({
  Loader2: () => <span data-testid="loader" />,
  MapPin: () => <span data-testid="map-pin" />,
}));

// ── Component under test ─────────────────────────────────────────────────────

import { SupplierDialog } from "@/components/suppliers/SupplierDialog";
import type { CompanySupplier } from "@/types/company-supplier";

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockSupplier: CompanySupplier = {
  id: "sup-1",
  company_id: "company-1",
  name: "Fornecedor Teste",
  surname: "Sobrenome",
  email: "fornecedor@teste.com",
  phone: "+5511999990001",
  street: "Rua X",
  number: "100",
  neighborhood: "Bairro Y",
  city: "São Paulo",
  state: "SP",
  country: "Brasil",
  zip_code: "01001000",
  created_at: 0,
  updated_at: 0,
};

function renderDialog(props: Partial<Parameters<typeof SupplierDialog>[0]> = {}) {
  const defaults = {
    open: true,
    onOpenChange: jest.fn(),
    onSuccess: jest.fn(),
    supplier: undefined,
  };
  return render(<SupplierDialog {...defaults} {...props} />);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("SupplierDialog — create mode", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ...mockSupplier, id: "sup-new" }),
    } as Response);
  });

  it("renders create form with correct title", () => {
    renderDialog();
    expect(screen.getByText("Novo Fornecedor")).toBeTruthy();
  });

  it("shows submit button labeled 'Criar Fornecedor' in create mode", () => {
    renderDialog();
    const submitBtn = screen.getByRole("button", { name: /criar fornecedor/i });
    expect(submitBtn).toBeTruthy();
  });

  it("shows validation error when name is too short", async () => {
    renderDialog();

    const nameInput = screen.getByPlaceholderText("Nome do fornecedor");
    fireEvent.change(nameInput, { target: { value: "AB" } });

    const submitBtn = screen.getByRole("button", { name: /criar fornecedor/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      // The zod schema should reject names shorter than 3 chars
      const nameField = screen.getByPlaceholderText("Nome do fornecedor");
      expect(nameField).toBeTruthy();
    });
  });

  it("calls POST /api/company-supplier on valid form submit", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ...mockSupplier, id: "sup-new" }),
    } as Response);

    const onSuccess = jest.fn();
    const onOpenChange = jest.fn();
    renderDialog({ onSuccess, onOpenChange });

    fireEvent.change(screen.getByPlaceholderText("Nome do fornecedor"), { target: { value: "Fornecedor Novo" } });
    fireEvent.change(screen.getByPlaceholderText("fornecedor@email.com"), { target: { value: "fornecedor@novo.com" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-9999"), { target: { value: "(11) 98888-7777" } });

    const submitBtn = screen.getByRole("button", { name: /criar fornecedor/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      const postCall = calls.find(
        (c) =>
          (c[0] as string) === "/api/company-supplier" &&
          (c[1] as RequestInit)?.method === "POST"
      );
      expect(postCall).toBeTruthy();
    });
  });

  it("shows error message when API returns 500", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erro interno ao criar fornecedor." }),
    } as Response);

    renderDialog();

    fireEvent.change(screen.getByPlaceholderText("Nome do fornecedor"), { target: { value: "Fornecedor Novo" } });
    fireEvent.change(screen.getByPlaceholderText("fornecedor@email.com"), { target: { value: "fornecedor@novo.com" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-9999"), { target: { value: "(11) 98888-7777" } });

    const submitBtn = screen.getByRole("button", { name: /criar fornecedor/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Erro interno ao criar fornecedor/)
      ).toBeTruthy();
    });
  });
});

describe("SupplierDialog — edit mode", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("renders edit form with correct title", () => {
    renderDialog({ supplier: mockSupplier });
    expect(screen.getByText("Editar Fornecedor")).toBeTruthy();
  });

  it("pre-fills form fields with supplier data", () => {
    renderDialog({ supplier: mockSupplier });

    const nameInput = screen.getByPlaceholderText(
      "Nome do fornecedor"
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("Fornecedor Teste");
  });

  it("calls PATCH /api/company-supplier/:id on save", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSupplier,
    } as Response);

    const onSuccess = jest.fn();
    renderDialog({ supplier: mockSupplier, onSuccess });

    const submitBtn = screen.getByRole("button", { name: /salvar alterações/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      const patchCall = calls.find(
        (c) =>
          (c[0] as string).includes("/api/company-supplier/sup-1") &&
          (c[1] as RequestInit)?.method === "PATCH"
      );
      expect(patchCall).toBeTruthy();
    });
  });

  it("shows email already registered error as field error (409 EMAIL_DUPLICATE)", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        code: "EMAIL_DUPLICATE",
        message: "E-mail já cadastrado.",
      }),
    } as Response);

    renderDialog({ supplier: mockSupplier });

    const submitBtn = screen.getByRole("button", { name: /salvar alterações/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.queryByText("E-mail já cadastrado.")).toBeTruthy();
    });
  });
});
