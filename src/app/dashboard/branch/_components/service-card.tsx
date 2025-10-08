import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, DollarSign } from "lucide-react";

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
      className={`flex flex-col justify-between h-full transition-all hover:shadow-md ${
        isLinked
          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
          : "hover:border-primary/50"
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-2 text-base">
          <span className="flex-1 line-clamp-2">{service.name}</span>
          {isLinked ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </CardTitle>

        {(service.duration || service.price !== undefined) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {service.duration && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Clock className="w-3 h-3" />
                {service.duration} min
              </Badge>
            )}
            {service.price !== undefined && (
              <Badge variant="secondary" className="text-xs gap-1">
                <DollarSign className="w-3 h-3" />
                {service.price > 0
                  ? `R$ ${service.price.toFixed(2)}`
                  : "Gratuito"}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {isLinked ? (
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onUnlink(service.id)}
          >
            Desvincular
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
