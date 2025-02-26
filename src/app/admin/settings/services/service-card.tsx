import { HiOutlineMenuAlt1, HiOutlineDotsVertical } from "react-icons/hi";
import { FiUser } from "react-icons/fi";
import { BsUpload } from "react-icons/bs";
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
  onEdit,
  onDelete,
}: ServiceCardProps) => {
  const colorClass = getFixedColor(name);

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:shadow-md transition-shadow border-l-4 ${colorClass}`}
    >
      <div className="flex items-center space-x-3">
        <div className="rounded-full bg-gray-100 w-10 h-10 flex items-center justify-center">
          <HiOutlineMenuAlt1 />
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
        <button
          className="px-3 py-1.5 border text-sm text-gray-700 border-gray-300 hover:bg-gray-100 transition rounded-full
        flex justify-center items-center gap-2"
        >
          <BsUpload />
          Share
        </button>

        <DropdownMenu>
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
            <DropdownMenuItem onClick={onEdit}>
              <MdOutlineModeEdit className="ml-1" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
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
