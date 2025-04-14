import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  price?: number;
}

interface ServiceCardProps {
  service: Service;
  isLinked: boolean;
  onLink: (id: number) => void;
  onUnlink: (id: number) => void;
}

export function ServiceCard({
  service,
  isLinked,
  onLink,
  onUnlink,
}: ServiceCardProps) {
  return (
    <Card
      className={`flex flex-col justify-between h-full shadow-sm hover:shadow-md transition ${
        isLinked ? "border-green-500 bg-green-50" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isLinked && <CheckCircle className="text-green-500 w-5 h-5" />}
          {service.name}
        </CardTitle>

        {(service.duration || service.price) && (
          <CardDescription>
            {service.duration ? `${service.duration} min` : ""}
            {service.price && service.price > 0
              ? ` • R$ ${service.price.toFixed(2)}`
              : service.price === 0
              ? " • Gratuito"
              : ""}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {isLinked ? (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onUnlink(service.id)}
          >
            Desvincular Serviço
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={() => onLink(service.id)}
          >
            Vincular Serviço
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
