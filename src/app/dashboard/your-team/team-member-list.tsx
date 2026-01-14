"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Employee } from "../../../../types/company";

type TeamMemberListProps = {
  employees: Employee[];
  loading: boolean;
  selectedMember: Employee | null;
  onSelectMember: (member: Employee) => void;
  emptyMessage?: string;
};

const getInitials = (member: Employee) => {
  const first = member.name?.trim().charAt(0);
  const last = member.surname?.trim().charAt(0);
  const initials = [first, last].filter(Boolean).join("");
  return initials ? initials.toUpperCase() : "?";
};

export const TeamMemberList = ({
  employees,
  loading,
  selectedMember,
  onSelectMember,
  emptyMessage,
}: TeamMemberListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Skeleton className="rounded-xl w-10 h-10 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {emptyMessage || "Nenhum funcion\u00e1rio cadastrado"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map(member => {
        const isSelected = selectedMember?.id === member.id;
        const servicesCount = Array.isArray(member.services)
          ? member.services.length
          : 0;
        const branchesCount = Array.isArray(member.branches)
          ? member.branches.length
          : 0;

        return (
          <Card
            key={member.id}
            onClick={() => onSelectMember(member)}
            className={cn(
              "cursor-pointer border-border bg-card p-4 shadow-sm transition-all card-hover",
              isSelected
                ? "border-primary bg-primary/5"
                : "hover:bg-accent/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow w-10 h-10 flex items-center justify-center font-semibold text-primary-foreground flex-shrink-0">
                {getInitials(member)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {member.name} {member.surname}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.role || "Profissional"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {servicesCount} servi\u00e7o{servicesCount === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {branchesCount} filial{branchesCount === 1 ? "" : "is"}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
