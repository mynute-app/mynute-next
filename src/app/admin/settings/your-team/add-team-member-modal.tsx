import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "../../../../../schema";
import { useToast } from "@/hooks/use-toast";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

type FormValues = z.infer<typeof formSchema>;

export default function AddTeamMemberDialog({
  isOpen,
  setIsOpen,
}: AddTeamMemberDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamMembers: [{ fullName: "", email: "", permission: "No access" }],
    },
  });
  const { toast } = useToast();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });

 const onSubmit = async (values: FormValues) => {
   try {
     // Para cada membro da equipe, faz um POST individualmente para adicionar ao `json-server`
     for (const member of values.teamMembers) {
       const response = await fetch("http://localhost:3333/team-members", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           fullName: member.fullName,
           email: member.email,
           permission: member.permission,
         }),
       });

       if (!response.ok) {
         throw new Error("Erro ao enviar os dados do membro da equipe");
       }
     }

     toast({
       title: "Sucesso",
       description: "Membros da equipe adicionados com sucesso!",
     });

     // Limpa o formulário e fecha o modal após o envio bem-sucedido
     reset();
     setIsOpen(false);

   } catch (error) {
     console.error("Erro ao enviar dados dos membros da equipe:", error);
     toast({
       title: "Erro",
       description: "Ocorreu um erro ao enviar os dados.",
       variant: "destructive",
     });
   }
 };



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="backdrop-blur-md p-6 max-w-5xl">
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Add team members
        </DialogTitle>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex space-x-4 mt-4 justify-center items-center"
          >
            <div className="flex-1 h-24">
              <label className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <Controller
                control={control}
                name={`teamMembers.${index}.fullName`}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Full name"
                    className={`w-full p-2 border rounded ${
                      errors.teamMembers?.[index]?.fullName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                )}
              />
              {errors.teamMembers?.[index]?.fullName && (
                <p className="text-red-500 text-sm">
                  {errors.teamMembers[index]?.fullName?.message}
                </p>
              )}
            </div>
            <div className="flex-1 h-24">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Controller
                control={control}
                name={`teamMembers.${index}.email`}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Email"
                    className={`w-full p-2 border rounded ${
                      errors.teamMembers?.[index]?.email
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                )}
              />
              {errors.teamMembers?.[index]?.email && (
                <p className="text-red-500 text-sm">
                  {errors.teamMembers[index]?.email?.message}
                </p>
              )}
            </div>
            <div className="flex-1 h-24">
              <label className="block text-sm font-medium text-gray-700">
                Permission level
              </label>
              <Controller
                control={control}
                name={`teamMembers.${index}.permission`}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full p-2 border rounded ${
                      errors.teamMembers?.[index]?.permission
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option>No access</option>
                    <option>Access only</option>
                    <option>Read only</option>
                    <option>Edit</option>
                  </select>
                )}
              />
              {errors.teamMembers?.[index]?.permission && (
                <p className="text-red-500 text-sm">
                  {errors.teamMembers[index]?.permission?.message}
                </p>
              )}
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-5 text-gray-500 hover:text-red-600"
              >
                <IoMdClose size={24} />
              </button>
            )}
          </div>
        ))}

        <DialogDescription className="text-sm text-gray-600 mt-4 flex items-start space-x-1">
          <span className="flex items-center gap-2">
            <AiOutlineInfoCircle className="text-blue-500" size={20} />
            ‘Access only’ team members will be emailed an invitation with a
            temporary password.
          </span>
        </DialogDescription>

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() =>
              append({ fullName: "", email: "", permission: "No access" })
            }
            className="text-blue-600 hover:underline"
          >
            + Add more
          </button>

          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="bg-blue-600 text-white"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
