"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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

const BUTTON_SHAPES = ["pill", "rounded", "rectangle"];
const THEMES = ["system", "light", "dark"];

export default function BrandAppearanceSettings() {
  const [selectedColor, setSelectedColor] = useState("#1a1a1a");
  const [customColor, setCustomColor] = useState("#1a1a1a");
  const [selectedShape, setSelectedShape] = useState("rectangle");
  const [selectedTheme, setSelectedTheme] = useState("system");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Aparência</h3>
        <p className="text-sm text-muted-foreground">
          Estilize sua página de agendamento com base na identidade da sua
          marca.
        </p>
      </div>

      {/* Brand Color */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Cor principal</h4>
        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map(color => (
            <div key={color}>
              {color === "custom" ? (
                <label className="relative">
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
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                      selectedColor === customColor
                        ? "ring-2 ring-black"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: customColor }}
                  />
                </label>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
                    selectedColor === color
                      ? "ring-2 ring-black"
                      : "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Button Shape */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Formato do botão</h4>
        <div className="grid grid-cols-3 gap-4">
          {BUTTON_SHAPES.map(shape => (
            <button
              key={shape}
              type="button"
              onClick={() => setSelectedShape(shape)}
              className={cn(
                "border p-4 rounded-md flex flex-col items-center gap-1 text-sm",
                selectedShape === shape ? "border-black" : "border-gray-200"
              )}
            >
              <div className="w-8 h-2 bg-gray-400" />
              {shape.charAt(0).toUpperCase() + shape.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Tema</h4>
        <div className="grid grid-cols-3 gap-4">
          {THEMES.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => setSelectedTheme(theme)}
              className={cn(
                "border p-4 rounded-md flex flex-col items-center gap-1 text-sm",
                selectedTheme === theme ? "border-black" : "border-gray-200"
              )}
            >
              {theme === "system"
                ? "Sistema"
                : theme === "light"
                ? "Claro"
                : "Escuro"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
