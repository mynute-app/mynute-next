import { Badge } from "@/components/ui/badge";
import { BiLandscape } from "react-icons/bi";

interface ServiceCardProps {
  title: string;
  subtitle: string;
  price: string;
  duration: string;
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
      className={`bg-white px-4 flex items-center gap-2 h-32 shadow-md rounded-lg cursor-pointer transition-transform transform hover:shadow-lg ${
        isSelected
          ? "border-2 border-primary bg-primary/10"
          : "border border-gray-200"
      }`}
    >
      {/* Ícone representando o serviço */}
      <div className="flex-shrink-0">
        <div className="md:w-14 md:h-14 rounded-full bg-gray-100 flex items-center justify-center p-2">
          <BiLandscape className="text-primary size-5"  />
        </div>
      </div>

      {/* Informações principais do serviço */}
      <div className="flex flex-col flex-grow overflow-hidden">
        <span className="text-sm md:text-lg font-bold text-gray-900 truncate">
          {title}
        </span>
        <span className="text-sm text-gray-600 truncate">{subtitle}</span>
      </div>

      {/* Informações adicionais: preço e duração */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm md:text-lg font-bold text-green-600">
          {price}
        </span>
        <Badge
          variant="outline"
          className="text-xs bg-yellow-100 text-yellow-800 border-none"
        >
          {duration}
        </Badge>
      </div>
    </div>
  );
}
