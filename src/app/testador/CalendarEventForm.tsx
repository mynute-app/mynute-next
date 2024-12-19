"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

// Validação com Zod
const calendarEventSchema = z.object({
  summary: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  startDateTime: z.string().min(1, "A data e hora de início são obrigatórias"),
  endDateTime: z.string().min(1, "A data e hora de término são obrigatórias"),
  attendees: z.array(z.string().email("E-mail inválido")).optional(),
});

type CalendarEventFormData = z.infer<typeof calendarEventSchema>;

export const CalendarEventForm = () => {
  // const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      summary: "",
      description: "",
      startDateTime: "",
      endDateTime: "",
    },
  });

  const onSubmit = async (data: CalendarEventFormData) => {
    // const accessToken = session?.accessToken; // Pega o token
    // console.log("Access Token:", accessToken);
    // Transformar os dados no formato esperado pela API
    const event = {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.startDateTime,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: data.endDateTime,
        timeZone: "America/Sao_Paulo",
      },
      attendees: data.attendees?.map(email => ({ email })) || [],
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(event),
        }
      );

      if (response.ok) {
        const eventData = await response.json();
        console.log("Evento criado com sucesso:", eventData);
        alert("Evento criado com sucesso!");
      } else {
        const errorData = await response.json();
        console.error("Erro ao criar o evento:", errorData);
        alert("Erro ao criar o evento. Verifique os logs.");
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      alert("Erro inesperado ao criar o evento.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      {/* <div>{session?.user?.email}</div> */}
      
      <div>
        <label htmlFor="summary" className="block text-sm font-medium">
          Título
        </label>
        <Input id="summary" {...register("summary")} />
        {errors.summary && (
          <p className="text-red-500 text-sm">{errors.summary.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div>
        <label htmlFor="startDateTime" className="block text-sm font-medium">
          Início (ISO Format)
        </label>
        <Input
          id="startDateTime"
          type="datetime-local"
          {...register("startDateTime")}
        />
        {errors.startDateTime && (
          <p className="text-red-500 text-sm">{errors.startDateTime.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="endDateTime" className="block text-sm font-medium">
          Término (ISO Format)
        </label>
        <Input
          id="endDateTime"
          type="datetime-local"
          {...register("endDateTime")}
        />
        {errors.endDateTime && (
          <p className="text-red-500 text-sm">{errors.endDateTime.message}</p>
        )}
      </div>
      <Button type="submit">Enviar</Button>
    </form>
  );
};
