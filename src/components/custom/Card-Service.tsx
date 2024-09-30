import { Badge } from "@/components/ui/badge";
import { BiLandscape } from "react-icons/bi";

interface ServiceCardProps {
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  iconSrc: string;
  onClick?: () => void; 
  isSelected?: boolean; 
}

export function CardService({
  title,
  subtitle,
  price,
  duration,
  onClick,
  isSelected = false,
}: ServiceCardProps) {
  return (
    <div
      onClick={onClick} 
      className={`bg-white p-4 flex items-center gap-4 h-32 md:h-48 shadow-md rounded-md cursor-pointer 
      transition-all ${
        isSelected ? "border-2 border-primary" : "border border-transparent"
      } 
   `}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <BiLandscape className="text-gray-600" size={24} />
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <span className="text-gray-800 font-semibold">{title}</span>
        <span className="text-gray-600 text-sm">{subtitle}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-green-500 font-bold">{price}</span>
        <Badge
          variant="outline"
          className="text-sm bg-yellow-200 text-yellow-800"
        >
          {duration}
        </Badge>
      </div>
    </div>
  );
}
