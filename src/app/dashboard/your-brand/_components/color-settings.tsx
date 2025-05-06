"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  bannerColor: string;
  primaryColor: string;
  onChange: (field: "bannerColor" | "primaryColor", value: string) => void;
};

export default function ColorSettings({
  bannerColor,
  primaryColor,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <ColorItem
        label="Cor do banner"
        value={bannerColor}
        onChange={val => onChange("bannerColor", val)}
      />
      <ColorItem
        label="Cor principal"
        value={primaryColor}
        onChange={val => onChange("primaryColor", val)}
      />
    </div>
  );
}

function ColorItem({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm text-gray-700">{label}</Label>

      <div className="flex items-center justify-between gap-4 border rounded-md px-4 py-2 shadow-sm bg-white">
        {/* Preview visual */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-6 h-6 rounded-md border shadow-inner",
              value === "#ffffff" && "border-gray-300"
            )}
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-muted-foreground font-mono">
            {value.toUpperCase()}
          </span>
        </div>

        {/* Picker */}
        <div className="relative w-6 h-6 rounded-md overflow-hidden border shadow-inner">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
