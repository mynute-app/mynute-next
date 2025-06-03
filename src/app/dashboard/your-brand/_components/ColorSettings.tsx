"use client";

import { Label } from "@/components/ui/label";

type ColorSettingsProps = {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  onChange: (colors: ColorSettingsProps["colors"]) => void;
};

export default function ColorSettings({
  colors,
  onChange,
}: ColorSettingsProps) {
  const handleColorChange = (field: keyof typeof colors, value: string) => {
    onChange({ ...colors, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cores da Marca</h2>

      {(Object.keys(colors) as (keyof typeof colors)[]).map(field => (
        <div key={field} className="flex items-center gap-4">
          <Label className="w-32 capitalize">{field}</Label>
          <input
            type="color"
            value={colors[field]}
            onChange={e => handleColorChange(field, e.target.value)}
            className="h-8 w-16 border rounded"
          />
          <span className="text-sm text-gray-600">{colors[field]}</span>
        </div>
      ))}
    </div>
  );
}
