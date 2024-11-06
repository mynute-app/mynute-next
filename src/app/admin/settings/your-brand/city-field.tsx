import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CityFieldProps {
  register: any;
  error?: string;
}

export function CityField({ register, error }: CityFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location.city">City</Label>
      <Input
        id="location.city"
        placeholder="City"
        {...register("location.city")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
