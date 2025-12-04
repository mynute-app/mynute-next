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
      className={`flex flex-col justify-between h-full transition-all shadow-sm hover:shadow-md ${
        isLinked
          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
          : "hover:border-primary/30"
      }`}
    >
      <CardHeader className="pb-3 p-4">
        <CardTitle className="flex items-start justify-between gap-2 text-sm">
          <span className="flex-1 line-clamp-2 font-semibold">
            {service.name}
          </span>
          {isLinked ? (
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </CardTitle>

        {(service.duration || service.price !== undefined) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {service.duration && (
              <Badge variant="secondary" className="text-xs gap-1 px-2 py-0.5">
                <Clock className="w-3 h-3" />
                {service.duration} min
              </Badge>
            )}
            {service.price !== undefined && (
              <Badge variant="secondary" className="text-xs gap-1 px-2 py-0.5">
                <DollarSign className="w-3 h-3" />
                {service.price > 0
                  ? `R$ ${service.price.toFixed(2)}`
                  : "Gratuito"}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 p-4">
        {isLinked ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onUnlink(service.id)}
          >
            Desvincular
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => onLink(service.id)}
          >
            Vincular
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
