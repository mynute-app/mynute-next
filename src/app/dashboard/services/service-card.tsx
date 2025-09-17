import { HiOutlineMenuAlt1, HiOutlineDotsVertical } from "react-icons/hi";
import { FiUser } from "react-icons/fi";
import { BsUpload } from "react-icons/bs";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineModeEdit } from "react-icons/md";
import { GoTrash } from "react-icons/go";

type ServiceCardProps = {
  name: string;
  duration?: string;
  buffer?: string;
  price?: string;
  imageUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

// Função para gerar uma cor fixa com base no nome
const getFixedColor = (name: string) => {
  const colors = [
    "border-l-blue-500",
    "border-l-red-500",
    "border-l-green-500",
    "border-l-yellow-500",
    "border-l-purple-500",
    "border-l-pink-500",
    "border-l-indigo-500",
  ];
  // Calcula um índice baseado no nome
  const index =
    name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const ServiceCard = ({
  name,
  duration,
  buffer,
  price,
  imageUrl,
  onEdit,
  onDelete,
}: ServiceCardProps) => {
  const colorClass = getFixedColor(name);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleEdit = () => {
    setDropdownOpen(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    onDelete?.();
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:shadow-md transition-shadow border-l-4 ${colorClass}`}
    >
      <div className="flex items-center space-x-3">
        <div className="rounded-full bg-gray-100 w-10 h-10 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <HiOutlineMenuAlt1 />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">
            Duração: {duration} · {price}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition">
          <FiUser />
        </button>

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition">
              <HiOutlineDotsVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-[150px]"
            align="end"
            side="bottom"
            sideOffset={5}
          >
            <DropdownMenuItem onClick={handleEdit}>
              <MdOutlineModeEdit className="ml-1" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <GoTrash className="ml-1" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ServiceCard;
