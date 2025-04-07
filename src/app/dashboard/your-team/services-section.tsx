"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCompany } from "@/hooks/get-company";
import { Skeleton } from "@/components/ui/skeleton";
import { Service } from "../../../../types/company";
import { TeamMember } from "../../../../types/TeamMember";
import { toast } from "@/hooks/use-toast";

type Props = {
  selectedMember: TeamMember | null;
};

export function ServicesSection({ selectedMember }: Props) {
  const { company, loading } = useCompany();
  const services: Service[] = company?.services ?? [];

  const handleLinkService = async (serviceId: number) => {
    if (!selectedMember) {
      toast({
        title: "Erro",
        description: "Selecione um membro antes de vincular o serviço.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(
        `/api/employee/${selectedMember.id}/service/${serviceId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Erro ao vincular o serviço");

      toast({
        title: "Serviço vinculado",
        description: `O serviço foi vinculado ao membro ${selectedMember.name}.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao vincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        Nenhum serviço encontrado para esta empresa.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {services.map(service => (
        <Card key={service.id} className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription>
              {service.duration} min •{" "}
              {service.price && Number(service.price) > 0
                ? `R$ ${Number(service.price).toFixed(2)}`
                : "Gratuito"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleLinkService(service.id)}
            >
              Vincular Serviço
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
