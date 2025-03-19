import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AboutFieldProps {
  register: any;
  error?: string;
}

export function AboutField({ register, error }: AboutFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="about">About</Label>
      <Textarea
        id="about"
        placeholder="Write about the business..."
        {...register("about")}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
