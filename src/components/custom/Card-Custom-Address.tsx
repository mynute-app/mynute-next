import React from "react";
import { MapPin } from "lucide-react";

interface CardCustomProps {
  title: string;
  description?: string;
  subTitle?: string;
  extraInfo?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const CardCustomAddress: React.FC<CardCustomProps> = ({
  title,
  description,
  subTitle,
  extraInfo,
  onClick,
  isSelected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white shadow-md rounded-xl flex flex-col gap-3 p-4 cursor-pointer transition-transform transform hover:scale-105
    ${
      isSelected
        ? "border-2 border-primary bg-primary/10"
        : "border border-gray-200"
    }
  `}
      style={{
        minWidth: "250px",
        maxWidth: "320px",
        minHeight: "150px",
        height: "auto",
        maxHeight: "200px",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center bg-gray-100 p-2 rounded-full shadow">
          <MapPin className="text-primary w-5 h-5" />
        </div>
        <h1 className="text-base font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>

      <div className="text-gray-700 text-sm">
        <p>{subTitle}</p>
        <p className="text-xs text-gray-500">{description}</p>
        {extraInfo && (
          <p className="text-xs text-gray-400 italic">{extraInfo}</p>
        )}
      </div>
    </div>
  );
};
