import {
  formatFinancialCurrency,
  normalizeDateStr,
} from "@/lib/financial-utils";

describe("formatFinancialCurrency", () => {
  it("formats zero cents as R$ 0,00", () => {
    expect(formatFinancialCurrency(0)).toBe("R$\u00a00,00");
  });

  it("formats 100 cents as R$ 1,00", () => {
    expect(formatFinancialCurrency(100)).toBe("R$\u00a01,00");
  });

  it("formats 5990 cents as R$ 59,90", () => {
    expect(formatFinancialCurrency(5990)).toBe("R$\u00a059,90");
  });

  it("formats 99999 cents as R$ 999,99", () => {
    expect(formatFinancialCurrency(99999)).toBe("R$\u00a0999,99");
  });

  it("formats large amount (100000 cents = R$ 1.000,00)", () => {
    expect(formatFinancialCurrency(100000)).toBe("R$\u00a01.000,00");
  });

  it("formats negative amount (estorno)", () => {
    const result = formatFinancialCurrency(-5990);
    expect(result).toContain("59,90");
  });
});

describe("normalizeDateStr", () => {
  it("truncates RFC3339 datetime to YYYY-MM-DD", () => {
    expect(normalizeDateStr("2026-05-01T00:00:00Z")).toBe("2026-05-01");
  });

  it("leaves YYYY-MM-DD string unchanged", () => {
    expect(normalizeDateStr("2026-05-01")).toBe("2026-05-01");
  });

  it("truncates RFC3339 with timezone offset", () => {
    expect(normalizeDateStr("2026-12-31T23:59:59-03:00")).toBe("2026-12-31");
  });
});

