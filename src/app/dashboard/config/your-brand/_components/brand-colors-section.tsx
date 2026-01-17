"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useCompanyColors,
  type CompanyColors,
} from "@/hooks/use-company-colors";

type BrandColorsSectionProps = {
  companyId: string;
  initialColors?: CompanyColors;
};

const fallbackColors: Required<
  Pick<CompanyColors, "primary" | "secondary" | "tertiary" | "quaternary">
> = {
  primary: "#1f9d8a",
  secondary: "#f59e0b",
  tertiary: "#22c55e",
  quaternary: "#6366f1",
};

export default function BrandColorsSection({
  companyId,
  initialColors,
}: BrandColorsSectionProps) {
  const { updateCompanyColors, loading } = useCompanyColors();
  const [colors, setColors] = useState<CompanyColors>({
    primary: initialColors?.primary || fallbackColors.primary,
    secondary: initialColors?.secondary || fallbackColors.secondary,
    tertiary: initialColors?.tertiary || fallbackColors.tertiary,
    quaternary: initialColors?.quaternary || fallbackColors.quaternary,
  });

  useEffect(() => {
    if (!initialColors) return;
    setColors(prev => ({
      ...prev,
      primary: initialColors.primary || prev.primary || fallbackColors.primary,
      secondary:
        initialColors.secondary || prev.secondary || fallbackColors.secondary,
      tertiary:
        initialColors.tertiary || prev.tertiary || fallbackColors.tertiary,
      quaternary:
        initialColors.quaternary ||
        prev.quaternary ||
        fallbackColors.quaternary,
    }));
  }, [initialColors]);

  const handleSave = async () => {
    if (!companyId) return;
    await updateCompanyColors(companyId, colors);
  };

  const handleChange = (key: keyof CompanyColors) => (value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const swatchStyle = (value?: string) => ({
    backgroundColor: value || "transparent",
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        Cores da Marca
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Cor Principal</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={colors.primary ?? ""}
              onChange={event => handleChange("primary")(event.target.value)}
              className="h-10 w-10 p-1"
              aria-label="Selecionar cor principal"
            />
            <Input
              value={colors.primary ?? ""}
              onChange={event => handleChange("primary")(event.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Cor de Destaque</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={colors.secondary ?? ""}
              onChange={event => handleChange("secondary")(event.target.value)}
              className="h-10 w-10 p-1"
              aria-label="Selecionar cor de destaque"
            />
            <Input
              value={colors.secondary ?? ""}
              onChange={event => handleChange("secondary")(event.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Cor de Sucesso</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={colors.tertiary ?? ""}
              onChange={event => handleChange("tertiary")(event.target.value)}
              className="h-10 w-10 p-1"
              aria-label="Selecionar cor de sucesso"
            />
            <Input
              value={colors.tertiary ?? ""}
              onChange={event => handleChange("tertiary")(event.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          className="btn-gradient"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar cores"}
        </Button>
      </div>
    </div>
  );
}
