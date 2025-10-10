"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { Employee } from "../../../../types/company";

type TeamMemberListProps = {
  employees: Employee[];
  loading: boolean;
  selectedMember: any | null;
  onSelectMember: (member: any) => void;
};

export const TeamMemberList = ({
  employees,
  loading,
  selectedMember,
  onSelectMember,
}: TeamMemberListProps) => {
  return (
    <>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="rounded-full w-10 h-10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <Card className="p-6 text-center">
          <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum funcionário cadastrado
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {employees.map((member: Employee) => (
            <Card
              key={member.id}
              onClick={() => onSelectMember(member)}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedMember?.id === member.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center font-semibold text-primary flex-shrink-0">
                  {member.name ? member.name[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {member.name} {member.surname}
                  </p>
                  {member.role && (
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
