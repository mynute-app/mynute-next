import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Table } from "../ui/table";
import { Input } from "../ui/input";

const AdminPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, time: "08:00" },
    { id: 2, time: "08:30" },
    // Adicione outros horários aqui
  ]);

  const { register, handleSubmit, reset } = useForm();

  const addTimeSlot = (data: any) => {
    setTimeSlots([...timeSlots, { id: timeSlots.length + 1, time: data.time }]);
    setShowModal(false);
    reset(); // Limpar o formulário após o envio
  };

  const removeTimeSlot = (id: any) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gerenciar Horários</h1>

      {/* Botão para adicionar novo horário */}
      <Button onClick={() => setShowModal(true)} variant="default">
        Adicionar Horário
      </Button>

      {/* Tabela de horários */}
      <Table>
        <thead>
          <tr>
            <th>Horário</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot.id}>
              <td>{slot.time}</td>
              <td>
                <Button
                  variant="default"
                  onClick={() => removeTimeSlot(slot.id)}
                >
                  Remover
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal customizado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Adicionar Novo Horário</h2>
            <form onSubmit={handleSubmit(addTimeSlot)}>
              <Input
                type="text"
                placeholder="Horário (ex: 08:00)"
                {...register("time", { required: true })}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="default" className="ml-2">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
