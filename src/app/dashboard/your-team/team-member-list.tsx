// components/your-team/team-member-list.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";
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
      {/* Search bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search"
          className="w-full p-2 pl-10 rounded border border-gray-300"
        />
        <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
      </div>

      <ul className="space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="p-2 rounded cursor-pointer bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="rounded-full bg-gray-300 w-8 h-8" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </li>
            ))
          : employees.map((member: Employee) => (
              <li
                key={member.id}
                className={`p-2 rounded cursor-pointer ${
                  selectedMember?.id === member.id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onSelectMember(member)}
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center font-bold text-gray-700">
                    {member.name ? member.name[0] : "?"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.name} {member.surname}
                    </p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
              </li>
            ))}
      </ul>
    </>
  );
};
