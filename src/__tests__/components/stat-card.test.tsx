/**
 * Jest component tests for StatCard.
 */
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatCard } from "@/app/dashboard/_components/stat-card";

describe("StatCard", () => {
  // ─── Happy path ──────────────────────────────────────────────────────────────

  it("renders the title and value", () => {
    render(
      <StatCard title="Total de Clientes" value={42} icon={Users} />
    );

    expect(screen.getByText("Total de Clientes")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the subtitle when provided", () => {
    render(
      <StatCard title="Agendamentos" value={10} subtitle="+3 esta semana" icon={Users} />
    );

    expect(screen.getByText("+3 esta semana")).toBeInTheDocument();
  });

  it("does not render subtitle when prop is omitted", () => {
    const { container } = render(<StatCard title="Serviços" value={0} icon={Users} />);
    // Subtitle renders as <p class="text-sm text-muted-foreground"> (no font-medium)
    // Title renders as <p class="text-sm font-medium text-muted-foreground"> (has font-medium)
    // Querying for subtitle-only paragraph confirms the conditional block did not render
    expect(
      container.querySelector("p.text-muted-foreground:not(.font-medium)")
    ).toBeNull();
  });

  it("renders icon as svg element", () => {
    const { container } = render(
      <StatCard title="Test" value={1} icon={Users} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  // ─── Trend indicator ─────────────────────────────────────────────────────────

  it("renders positive trend with + prefix and % suffix", () => {
    render(
      <StatCard
        title="Receita"
        value="R$ 1.200"
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
    );

    // Exact formatted string: +12%
    expect(screen.getByText("+12%")).toBeInTheDocument();
    // Comparison label always rendered alongside the trend value
    expect(screen.getByText("vs. mes anterior")).toBeInTheDocument();
  });

  it("renders positive trend with text-success CSS class", () => {
    render(
      <StatCard
        title="Receita"
        value="R$ 1.200"
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
    );

    const trendEl = screen.getByText("+12%");
    expect(trendEl).toHaveClass("text-success");
    expect(trendEl).not.toHaveClass("text-destructive");
  });

  it("renders negative trend with - prefix and % suffix", () => {
    render(
      <StatCard
        title="Cancelamentos"
        value={5}
        icon={Users}
        trend={{ value: 8, isPositive: false }}
      />
    );

    // Exact formatted string: -8%
    expect(screen.getByText("-8%")).toBeInTheDocument();
  });

  it("renders negative trend with text-destructive CSS class", () => {
    render(
      <StatCard
        title="Cancelamentos"
        value={5}
        icon={Users}
        trend={{ value: 8, isPositive: false }}
      />
    );

    const trendEl = screen.getByText("-8%");
    expect(trendEl).toHaveClass("text-destructive");
    expect(trendEl).not.toHaveClass("text-success");
  });

  it("renders without trend when prop is omitted", () => {
    render(<StatCard title="Serviços" value={0} icon={Users} />);

    expect(screen.queryByText(/vs\. mes anterior/)).not.toBeInTheDocument();
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────────

  it("renders a string value (e.g., formatted currency)", () => {
    render(
      <StatCard title="Receita" value="R$ 0,00" icon={Users} />
    );

    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
  });

  it("renders trend with value 0 as +0%", () => {
    render(
      <StatCard title="Test" value={0} icon={Users} trend={{ value: 0, isPositive: true }} />
    );
    expect(screen.getByText("+0%")).toBeInTheDocument();
  });

  // ─── Variant prop ─────────────────────────────────────────────────────────────

  it.each([
    ["default", "bg-muted", "text-muted-foreground"],
    ["primary", "bg-primary/10", "text-primary"],
    ["success", "bg-[hsl(var(--success)/0.12)]", "text-[hsl(var(--success))]"],
    ["warning", "bg-[hsl(var(--warning)/0.12)]", "text-[hsl(var(--warning))]"],
    ["accent", "bg-accent/10", "text-accent"],
  ] as const)(
    "applies correct icon background class for variant=%s",
    (variant, expectedBgClass, expectedIconColorClass) => {
      const { container } = render(
        <StatCard title="Test" value={1} icon={Users} variant={variant} />
      );
      // Icon wrapper should have the bg class
      const iconWrapper = container.querySelector(`.${CSS.escape(expectedBgClass)}`);
      expect(iconWrapper).toBeInTheDocument();
      // SVG icon should have the color class
      const icon = container.querySelector(`.${CSS.escape(expectedIconColorClass)}`);
      expect(icon).toBeInTheDocument();
    }
  );
});
