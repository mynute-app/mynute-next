"use client";

interface ColorConfig {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
}

interface ColorSettingsProps {
  colors: ColorConfig;
  onChange: (colors: ColorConfig) => void;
}

export default function ColorSettings({
  colors,
  onChange,
}: ColorSettingsProps) {
  // Cores predefinidas como na imagem
  const predefinedColors = [
    "#000000", // Preto
    "#FF5722", // Laranja-vermelho
    "#FF9800", // Laranja
    "#FFC107", // Amarelo
    "#9C27B0", // Roxo
    "#2196F3", // Azul
    "#8D6E63", // Marrom
    "#9E9E9E", // Cinza
    "#009688", // Verde água
    "#4CAF50", // Verde
  ];

  const handleColorSelect = (color: string) => {
    // Por enquanto, vamos apenas atualizar a cor primária
    // Depois você pode expandir a lógica conforme necessário
    const updatedColors = { ...colors, primary: color };
    onChange(updatedColors);
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-lg font-semibold">Brand color</div>
        <p className="text-sm text-gray-500">
          Style your Booking Page to reflect your brand identity.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {predefinedColors.map((color, index) => (
          <button
            key={index}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              colors.primary === color
                ? "border-gray-400 ring-2 ring-offset-2 ring-gray-300"
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
            title={`Selecionar cor ${color}`}
          />
        ))}

        {/* Color picker personalizado */}
        <div className="relative">
          <input
            type="color"
            value={colors.primary}
            onChange={e => handleColorSelect(e.target.value)}
            className="opacity-0 absolute inset-0 w-8 h-8 cursor-pointer z-10"
            title="Seletor de cor personalizado"
          />
          {/* Rosca colorida */}
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 cursor-pointer relative overflow-hidden pointer-events-none"
            style={{
              background: `conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
            }}
          >
            {/* Buraco no meio (rosca) */}
            <div className="absolute inset-2 bg-white rounded-full border border-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
