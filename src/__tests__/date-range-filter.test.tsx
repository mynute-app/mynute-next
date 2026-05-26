import { fireEvent, render, screen } from "@testing-library/react";
import { DateRangeFilter } from "@/app/dashboard/financeiro/_components/date-range-filter";

describe("DateRangeFilter", () => {
  it("calls onApply with valid range", () => {
    const onApply = jest.fn();

    render(
      <DateRangeFilter
        startDate="2026-05-01"
        endDate="2026-05-31"
        onApply={onApply}
      />,
    );

    fireEvent.change(screen.getByLabelText("Data inicial"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("Data final"), {
      target: { value: "2026-06-30" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(onApply).toHaveBeenCalledWith("2026-06-01", "2026-06-30");
  });

  it("shows validation message and does not call onApply when range is invalid", () => {
    const onApply = jest.fn();

    render(
      <DateRangeFilter
        startDate="2026-06-20"
        endDate="2026-06-10"
        onApply={onApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByText(/data final deve ser maior ou igual/i)).toBeInTheDocument();
  });
});
