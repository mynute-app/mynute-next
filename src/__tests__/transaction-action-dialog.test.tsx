import { fireEvent, render, screen } from "@testing-library/react";
import { TransactionActionDialog } from "@/app/dashboard/financeiro/_components/transaction-action-dialog";

describe("TransactionActionDialog", () => {
  it("submits create payload", () => {
    const onSubmit = jest.fn();

    render(
      <TransactionActionDialog
        open={true}
        mode="create"
        defaultTransactionType="income"
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/descricao/i), {
      target: { value: "Servico avulso" },
    });
    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: "120.90" },
    });
    fireEvent.change(screen.getByLabelText(/vencimento/i), {
      target: { value: "2026-06-15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      description: "Servico avulso",
      amount: 12090,
      transaction_type: "income",
      due_date: "2026-06-15",
    });
  });

  it("blocks invalid create submit", () => {
    const onSubmit = jest.fn();

    render(
      <TransactionActionDialog
        open={true}
        mode="create"
        defaultTransactionType="expense"
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/descricao/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/informe descricao e valor valido/i)).toBeInTheDocument();
  });

  it("submits pay payload", () => {
    const onSubmit = jest.fn();

    render(
      <TransactionActionDialog
        open={true}
        mode="pay"
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/valor cobrado/i), {
      target: { value: "75.50" },
    });
    fireEvent.change(screen.getByLabelText(/forma de pagamento/i), {
      target: { value: "pix" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirmar pagamento/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      charged_amount: 7550,
      payment_method: "pix",
    });
  });
});
