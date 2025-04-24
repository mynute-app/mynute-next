"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // opcional para estilos condicional

type Branch = {
  id: number;
  name: string;
};

type Props = {
  branches: Branch[];
  selected: number[];
  onChange: (ids: number[]) => void;
};

export function MultiSelectBranches({ branches, selected, onChange }: Props) {
  const toggleSelect = (id: number) => {
    const updated = selected.includes(id)
      ? selected.filter(branchId => branchId !== id)
      : [...selected, id];
    onChange(updated);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full h-8 text-xs justify-between")}
        >
          {selected.length
            ? `${selected.length} filiais selecionadas`
            : "Selecionar filiais"}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2 space-y-2">
        {branches.map(branch => (
          <label
            key={branch.id}
            className="flex items-center justify-between text-xs cursor-pointer"
            onClick={() => toggleSelect(branch.id)}
          >
            <span>{branch.name}</span>
            <Checkbox
              checked={selected.includes(branch.id)}
              onCheckedChange={() => toggleSelect(branch.id)}
            />
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
