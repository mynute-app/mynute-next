"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Service } from "../../../../types/company";
import { toast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { useGetCompany } from "@/hooks/get-company";

type Props = {
  selectedMember: any | null;
  setSelectedMember: (member: any) => void;
};

export function ServicesSection({ selectedMember, setSelectedMember }: Props) {
  const { company, loading } = useGetCompany();
  const services: Service[] = company?.services ?? [];
  
  const linkedServiceIds = new Set(
    selectedMember?.services?.map((s: Service) => s.id) ?? []
  );

  const handleLinkService = async (serviceId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/${selectedMember.id}/service/${serviceId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Erro ao vincular o serviço");

      const newService = services.find(s => s.id === serviceId);
      if (newService) {
        setSelectedMember({
          ...selectedMember,
          services: [...(selectedMember.services ?? []), newService],
        });
      }

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

  const handleUnlinkService = async (serviceId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/${selectedMember.id}/service/${serviceId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Erro ao desvincular o serviço");

      const updatedServices =
        selectedMember.services?.filter((s: Service) => s.id !== serviceId) ??
        [];

      setSelectedMember({
        ...selectedMember,
        services: updatedServices,
      });

      toast({
        title: "Serviço desvinculado",
        description: `O serviço foi removido do membro ${selectedMember.name}.`,
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Erro ao desvincular",
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
      {services.map(service => {
        const isLinked = linkedServiceIds.has(service.id);

        return (
          <Card key={service.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isLinked && <CheckCircle className="text-green-500 w-5 h-5" />}
                {service.name}
              </CardTitle>
              <CardDescription>
                {service.duration} min •{" "}
                {service.price && Number(service.price) > 0
                  ? `R$ ${Number(service.price).toFixed(2)}`
                  : "Gratuito"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLinked ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleUnlinkService(service.id)}
                >
                  Desvincular Serviço
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleLinkService(service.id)}
                >
                  Vincular Serviço
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
