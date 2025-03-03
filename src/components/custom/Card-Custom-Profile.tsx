import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

interface CardCustomProps {
  title: string;
  description?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const CardCustomProfile: React.FC<CardCustomProps> = ({
  title,
  description,
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
      <div className="md:flex-1 flex justify-center items-center">
        <Avatar className="w-14 h-14">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <div className=" flex-1">
        <h1 className="text-lg md:text-2xl font-bold text-center">{title}</h1>
        <p className="text-sm text-gray-500 text-center">{description}</p>
      </div>
    </div>
  );
};
