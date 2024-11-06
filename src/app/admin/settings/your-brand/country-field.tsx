import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CountryFieldProps {
  control: any;
  error?: string;
}

export function CountryField({ control, error }: CountryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location.country">Country</Label>
      <Controller
        name="location.country"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BR">Brazil</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              {/* Adicione outros países conforme necessário */}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
