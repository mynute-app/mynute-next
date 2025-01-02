import React from "react";
import { MapPin } from "lucide-react";

interface CardCustomProps {
  title: string;
  description?: string;
  subTitle?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const CardCustomAddress: React.FC<CardCustomProps> = ({
  title,
  description,
  subTitle,
  onClick,
  isSelected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white shadow-md rounded-lg flex flex-row md:flex-col gap-2 items-start px-2 py-4 cursor-pointer transition-transform transform  ${
        isSelected
          ? "border-2 border-primary bg-primary/10"
          : "border border-gray-200"
      }`}
      style={{ minWidth: "250px", maxWidth: "320px" }} // Controle de largura mínima e máxima
    >
      {/* Ícone representando o endereço */}
      <div className="flex items-center justify-center bg-gray-50 p-3 rounded-full shadow-md">
        <MapPin className="text-primary w-6 h-6" />
      </div>

      <div className="flex flex-col w-full overflow-hidden flex-1">
        <h1 className="text-sm md:text-lg font-bold text-gray-900 truncate">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-gray-600">{subTitle}</p>
        <p className="text-xs md:text-sm text-gray-600 italic">{description}</p>
      </div>
    </div>
  );
};
