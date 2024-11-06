import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StateFieldProps {
  control: any;
  error?: string;
}

export function StateField({ control, error }: StateFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location.state">State</Label>
      <Controller
        name="location.state"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              {/* Adicione outros estados conforme necessário */}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
