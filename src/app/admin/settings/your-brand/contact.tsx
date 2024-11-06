import {
  useFieldArray,
  Controller,
  Control,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { IoMdMore } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import { z } from "zod";
import { BusinessSchema } from "../../../../../schema";

type FormData = z.infer<typeof BusinessSchema>;

interface ContactProps {
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

export function Contact({ control, register, errors }: ContactProps) {
  const {
    fields: phoneFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "contact.phoneNumbers",
  });

  // Adiciona um campo inicial de telefone se ainda não houver nenhum
  if (phoneFields.length === 0) {
    append({ countryCode: "+55", phone: "" });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Contact details</h3>
      <p className="text-sm text-gray-600">
        Let your leads and customers know how to reach you.
      </p>

      <div className="space-y-2">
        <Label htmlFor="contact.email">Primary email</Label>
        <Input
          id="contact.email"
          placeholder="Enter email"
          type="email"
          {...register("contact.email")}
        />
        {errors.contact?.email && (
          <p className="text-sm text-red-500">{errors.contact.email.message}</p>
        )}
      </div>

      {phoneFields.map((field, index) => (
        <div key={field.id} className="flex space-x-2">
          <div className="w-1/4">
            <Label htmlFor={`contact.phoneNumbers.${index}.countryCode`}>
              Country Code
            </Label>
            <Controller
              name={`contact.phoneNumbers.${index}.countryCode`}
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="+55" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 (US)</SelectItem>
                    <SelectItem value="+55">+55 (BR)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.contact?.phoneNumbers?.[index]?.countryCode && (
              <p className="text-sm text-red-500">
                {errors.contact.phoneNumbers[index].countryCode.message}
              </p>
            )}
          </div>

          <div className="w-3/4">
            <Label htmlFor={`contact.phoneNumbers.${index}.phone`}>
              Phone number
            </Label>
            <div className="flex justify-center items-center gap-3">
              <Input
                id={`contact.phoneNumbers.${index}.phone`}
                placeholder="Enter phone number"
                {...register(`contact.phoneNumbers.${index}.phone`)}
              />
              {phoneFields.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center">
                      <IoMdMore className="size-5 cursor-pointer" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel
                      className="flex gap-2 items-center cursor-pointer"
                      onClick={() => remove(index)}
                    >
                      <FaRegTrashAlt />
                      Deletar
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {errors.contact?.phoneNumbers?.[index]?.phone && (
              <p className="text-sm text-red-500">
                {errors.contact.phoneNumbers[index].phone.message}
              </p>
            )}
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        onClick={() => append({ countryCode: "+55", phone: "" })}
        type="button"
      >
        + Add more
      </Button>
    </div>
  );
}
