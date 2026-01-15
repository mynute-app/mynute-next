"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Palette, Square, Sun, Moon, Monitor, Save } from "lucide-react";

const COLORS = [
  "#1a1a1a",
  "#e63946",
  "#f4a261",
  "#f9c74f",
  "#9b5de5",
  "#457b9d",
  "#c9ada7",
  "#adb5bd",
  "#2a9d8f",
  "#38b000",
  "custom",
];

const BUTTON_SHAPES = [
  { value: "pill", label: "Arredondado", icon: "rounded-full" },
  { value: "rounded", label: "Suave", icon: "rounded-lg" },
  { value: "rectangle", label: "Reto", icon: "rounded-none" },
];

const THEMES = [
  { value: "system", label: "Sistema", icon: Monitor },
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
];

export default function BrandAppearanceSettings() {
  const [selectedColor, setSelectedColor] = useState("#1a1a1a");
  const [customColor, setCustomColor] = useState("#1a1a1a");
  const [selectedShape, setSelectedShape] = useState("rectangle");
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Cores da Marca
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha a cor que representa sua marca na pagina de agendamento
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {COLORS.map(color => (
          <div key={color}>
            {color === "custom" ? (
              <label className="relative cursor-pointer group">
                <input
                  type="color"
                  value={customColor}
                  onChange={e => {
                    setCustomColor(e.target.value);
                    setSelectedColor(e.target.value);
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                    selectedColor === customColor
                      ? "ring-2 ring-primary ring-offset-2 scale-110"
                      : "border-gray-300 hover:scale-105"
                  )}
                  style={{ backgroundColor: customColor }}
                >
                  <Palette className="w-4 h-4 text-white" />
                </div>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all",
                  selectedColor === color
                    ? "ring-2 ring-primary ring-offset-2 scale-110"
                    : "border-gray-300 hover:scale-105"
                )}
                style={{ backgroundColor: color }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 border-t space-y-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Square className="w-4 h-4" />
            Formato dos Botoes
          </h3>
          <p className="text-sm text-muted-foreground">
            Defina o estilo dos botoes na pagina de agendamento
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {BUTTON_SHAPES.map(shape => (
            <button
              key={shape.value}
              type="button"
              onClick={() => setSelectedShape(shape.value)}
              className={cn(
                "border-2 p-4 rounded-lg flex flex-col items-center gap-3 text-sm transition-all hover:shadow-md",
                selectedShape === shape.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className={cn("w-16 h-10 bg-primary/80", shape.icon)} />
              <span className="font-medium">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t space-y-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Tema da Interface
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha o tema visual da pagina de agendamento
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {THEMES.map(theme => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.value}
                type="button"
                onClick={() => setSelectedTheme(theme.value)}
                className={cn(
                  "border-2 p-4 rounded-lg flex flex-col items-center gap-3 text-sm transition-all hover:shadow-md",
                  selectedTheme === theme.value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Icon className="w-8 h-8 text-muted-foreground" />
                <span className="font-medium">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 btn-gradient"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar Alteracoes"}
        </Button>
      </div>
    </div>
  );
}
