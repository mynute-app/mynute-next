"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    // TODO: Implementar save
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Cor Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cor Principal da Marca
          </CardTitle>
          <CardDescription>
            Escolha a cor que representa sua marca na página de agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Formato dos Botões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="w-5 h-5" />
            Formato dos Botões
          </CardTitle>
          <CardDescription>
            Defina o estilo dos botões na página de agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Tema da Interface
          </CardTitle>
          <CardDescription>
            Escolha o tema visual da página de agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
