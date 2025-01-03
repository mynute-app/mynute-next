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
      className={`bg-gray-100 shadow-md rounded-md flex md:flex-col py-5 md:h-32
        justify-center items-center px-4 cursor-pointer transition-all  ${
          isSelected ? "border-2 border-primary" : ""
        }`}
    >
      <div className="md:flex-1 flex justify-center items-center">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <div className=" flex-1">
        <h1 className="text-lg md:text-2xl font-bold text-center">{title}</h1>
        <p className="text-sm text-gray-500 text-center">
          {description}
        </p>
      </div>
    </div>
  );
};
