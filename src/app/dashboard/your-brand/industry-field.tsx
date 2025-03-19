import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IndustryFieldProps {
  control: any;
  error?: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredIndustries: string[];
}

export function IndustryField({
  control,
  error,
  searchTerm,
  setSearchTerm,
  filteredIndustries,
}: IndustryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="industry">Industry</Label>
      <Controller
        name="industry"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  placeholder="Search industries"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              {filteredIndustries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
