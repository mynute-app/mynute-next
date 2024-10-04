import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Importa o Textarea do shadcn
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const createdAddressSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

type CreatedAddressFormData = z.infer<typeof createdAddressSchema>;

export const CreatedAddress = ({
  closeModal,
  formRef,
}: {
  closeModal: () => void;
  formRef: React.MutableRefObject<HTMLFormElement | null>;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<CreatedAddressFormData>({
    resolver: zodResolver(createdAddressSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreatedAddressFormData) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3333/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Endereço criado!",
          description: "O endereço foi adicionado com sucesso.",
          variant: "default",
        });
        closeModal();
        form.reset();
      } else {
        toast({
          title: "Erro ao criar endereço",
          description: "Houve um problema ao adicionar o endereço.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de rede",
        description: "Não foi possível se conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        ref={formRef}
        className="space-y-4 flex flex-col px-2"
      >
        {/* Campo Title */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome do Endereço <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Address */}
        <FormField
          name="address"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Phone */}
        <FormField
          name="phone"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Description como Textarea do shadcn */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                {/* Usa o Textarea do shadcn */}
                <Textarea
                  {...field}
                  placeholder="Descrição detalhada do endereço"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
