import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  description: z.string().min(1, "A descrição é obrigatória"),
});

type CreatedAddressFormData = z.infer<typeof createdAddressSchema>;

export const CreatedAddress = ({ closeModal }: { closeModal: () => void }) => {
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
        const result = await response.json();
        console.log("Form data posted successfully:", result);

        toast({
          title: "Endereço criado!",
          description: "O endereço foi adicionado com sucesso.",
          variant: "default",
        });

        closeModal();

        form.reset();
      } else {
        console.error("Failed to post form data:", response.statusText);
        toast({
          title: "Erro ao criar endereço",
          description: "Houve um problema ao adicionar o endereço.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error posting form data:", error);
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
        className="space-y-4 flex flex-col"
      >
        {/* Campo Title */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Lá Família" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="São Roque" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões de submissão e cancelamento */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
