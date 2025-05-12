"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const OPTIONS = [
  { label: "Claro", value: false, icon: <Sun className="w-5 h-5" /> },
  { label: "Escuro", value: true, icon: <Moon className="w-5 h-5" /> },
];

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-gray-700">Tema</div>
      <div className="flex items-center gap-4">
        {OPTIONS.map(option => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "relative w-32 h-20 px-4 py-2 border rounded-xl flex flex-col justify-center items-start gap-1 text-left transition",
                isSelected
                  ? "border-black ring-black"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <span
                className={cn(
                  "absolute top-2 left-2 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center",
                  isSelected && "border-black"
                )}
              >
                {isSelected && (
                  <span className="w-2 h-2 bg-black rounded-full" />
                )}
              </span>
              <div className="flex flex-col items-center justify-center w-full mt-2">
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
