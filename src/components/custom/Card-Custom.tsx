import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

interface CardCustomProps {
  title: string;
  description?: string;
  onClick?: () => void; 
  isSelected?: boolean; 
}

export const CardCustom: React.FC<CardCustomProps> = ({
  title,
  description,
  onClick,
  isSelected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-100 shadow-md rounded-md flex md:flex-col justify-center items-center px-4 h-32 md:h-48 cursor-pointer transition-all ${
        isSelected ? "border-2 border-primary" : ""
      }`}
    >
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center">{title}</h1>
        <p className="text-sm text-gray-500 text-center">{description}</p>
      </div>
    </div>
  );
};
