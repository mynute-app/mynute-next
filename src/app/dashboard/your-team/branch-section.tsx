"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompany } from "@/hooks/get-company";
import { toast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { Branch as Branchs } from "../../../../types/company";


type Props = {
  selectedMember: any | null;
  setSelectedMember: (member: any) => void;
};

export function Branch({ selectedMember, setSelectedMember }: Props) {
  const { company, loading } = useCompany();
  const branches: Branchs[] = company?.branches ?? [];

  const linkedBranchIds = new Set(
    selectedMember?.branches?.map((s: Branchs) => s.id) ?? []
  );

  const handleLinkBranch = async (branchId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/branch/${selectedMember.id}/branch/${branchId}`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Erro ao vincular a filial");

      const branch = branches?.find(b => b.id === branchId);
      if (branch) {
        setSelectedMember({
          ...selectedMember,
          branches: [...(selectedMember.branches ?? []), branch],
        });
      }

      toast({
        title: "Filial vinculada",
        description: `A filial foi vinculada ao membro ${selectedMember.name}.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao vincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUnlinkBranch = async (branchId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/branch/${selectedMember.id}/branch/${branchId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Erro ao desvincular a filial");

      const updatedBranches =
        branches?.filter(b => b.id !== branchId) ?? [];

      setSelectedMember({
        ...selectedMember,
        branches: updatedBranches,
      });

      toast({
        title: "Filial desvinculada",
        description: `A filial foi removida do membro ${selectedMember.name}.`,
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

  if (!branches.length) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        Nenhuma filial encontrada para esta empresa.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {branches.map((branch: any) => {
        const isLinked = linkedBranchIds.has(branch.id);

        return (
          <Card key={branch.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isLinked && <CheckCircle className="text-green-500 w-5 h-5" />}
                {branch.name}
              </CardTitle>
              <CardDescription>
                {branch.city}, {branch.state}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div>
                <strong>Endereço:</strong> {branch.street}, {branch.number}
              </div>
              {branch.complement && (
                <div>
                  <strong>Complemento:</strong> {branch.complement}
                </div>
              )}
              <div>
                <strong>Bairro:</strong> {branch.neighborhood}
              </div>
              <div>
                <strong>CEP:</strong> {branch.zip_code}
              </div>
              <div>
                <strong>País:</strong> {branch.country}
              </div>

              <div className="pt-4">
                {isLinked ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleUnlinkBranch(branch.id)}
                  >
                    Desvincular Filial
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleLinkBranch(branch.id)}
                  >
                    Vincular Filial
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
