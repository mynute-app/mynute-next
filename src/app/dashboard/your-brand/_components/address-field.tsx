import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AddressFieldProps {
  register: any;
  error?: string;
  branch: any; // Alterado para receber o objeto da filial
  index: number;
}

export function AddressField({
  register,
  error,
  branch,
  index,
}: AddressFieldProps) {
  return (
    <div>
      <div className="font-bold text-lg">Endereço</div>
      <Accordion type="single" collapsible>
        <AccordionItem value={`branch-${index}`}>
          <AccordionTrigger className="text-base font-light ">
            {branch.name}
          </AccordionTrigger>

          <AccordionContent>
            <div className="p-4 rounded-md ">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`branches.${index}.location.street`}>
                    Street
                  </Label>
                  <Input
                    id={`branches.${index}.location.street`}
                    placeholder="Street name"
                    {...register(`branches.${index}.location.street`)}
                    defaultValue={branch.location?.street || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.number`}>
                    Number
                  </Label>
                  <Input
                    id={`branches.${index}.location.number`}
                    placeholder="Number"
                    {...register(`branches.${index}.location.number`)}
                    defaultValue={branch.location?.number || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.complement`}>
                    Complement
                  </Label>
                  <Input
                    id={`branches.${index}.location.complement`}
                    placeholder="Apt, suite, floor"
                    {...register(`branches.${index}.location.complement`)}
                    defaultValue={branch.location?.complement || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.neighborhood`}>
                    Neighborhood
                  </Label>
                  <Input
                    id={`branches.${index}.location.neighborhood`}
                    placeholder="Neighborhood"
                    {...register(`branches.${index}.location.neighborhood`)}
                    defaultValue={branch.location?.neighborhood || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.zip_code`}>
                    Zip Code
                  </Label>
                  <Input
                    id={`branches.${index}.location.zip_code`}
                    placeholder="00000-000"
                    {...register(`branches.${index}.location.zip_code`)}
                    defaultValue={branch.location?.zip_code || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.city`}>
                    City
                  </Label>
                  <Input
                    id={`branches.${index}.location.city`}
                    placeholder="City"
                    {...register(`branches.${index}.location.city`)}
                    defaultValue={branch.location?.city || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.state`}>
                    State
                  </Label>
                  <Input
                    id={`branches.${index}.location.state`}
                    placeholder="State"
                    {...register(`branches.${index}.location.state`)}
                    defaultValue={branch.location?.state || ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`branches.${index}.location.country`}>
                    Country
                  </Label>
                  <Input
                    id={`branches.${index}.location.country`}
                    placeholder="Country"
                    {...register(`branches.${index}.location.country`)}
                    defaultValue={branch.location?.country || ""}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
