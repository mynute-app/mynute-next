/**
 * Exemplo de uso do WorkScheduleManager atualizado
 *
 * Agora o componente tem uma única interface que combina visualização e configuração,
 * carrega os dados automaticamente e permite alternar entre modos.
 */

/* 
// Exemplo básico - o mais simples
const BasicUsageExample = () => {
  const employeeId = "employee-123";

  return <WorkScheduleManager employeeId={employeeId} />;
};

// Exemplo com dados opcionais (branches e services)
const AdvancedUsageExample = () => {
  const employeeId = "employee-123";
  const branches = [
    { id: "branch-1", name: "Filial Centro" },
    { id: "branch-2", name: "Filial Zona Sul" },
  ];
  const services = [
    { id: "service-1", name: "Corte de Cabelo" },
    { id: "service-2", name: "Barba" },
  ];

  const handleSuccess = () => {
    console.log("Work schedule atualizado com sucesso!");
  };

  return (
    <WorkScheduleManager
      employeeId={employeeId}
      branches={branches}
      services={services}
      onSuccess={handleSuccess}
    />
  );
};

// Exemplo com dados iniciais (caso você já tenha os dados)
const WithInitialDataExample = () => {
  const employeeId = "employee-123";
  const initialData = [
    {
      branch_id: "branch-1",
      employee_id: employeeId,
      start_time: "09:00",
      end_time: "17:00",
      time_zone: "America/Sao_Paulo",
      weekday: 1, // Segunda-feira
      services: [],
    },
  ];

  return (
    <WorkScheduleManager employeeId={employeeId} initialData={initialData} />
  );
};
*/

// COMO SUBSTITUIR em um dashboard de funcionários:
/*
// ANTES - com duas abas
case "breaks":
  return selectedMember ? (
    <WorkScheduleManager
      employeeId={selectedMember.id.toString()}
      initialData={selectedMember.work_schedule || []}
      branches={selectedMember.branches || []}
      services={selectedMember.services || []}
      defaultView="view"
    />
  ) : (
    <p>Selecione um membro para configurar os horários</p>
  );

// DEPOIS - interface única com carregamento automático
case "breaks":
  return selectedMember ? (
    <WorkScheduleManager
      employeeId={selectedMember.id.toString()}
      branches={selectedMember.branches || []}
      services={selectedMember.services || []}
      onSuccess={() => {
        console.log("Horários salvos com sucesso!");
        // Opcional: recarregar dados do funcionário
      }}
    />
  ) : (
    <p>Selecione um membro para configurar os horários</p>
  );
*/

/**
 * Funcionalidades do novo componente:
 *
 * 1. ✅ Interface única (sem abas)
 * 2. ✅ Carregamento automático de dados via API
 * 3. ✅ Botão para alternar entre visualização e edição
 * 4. ✅ Botão de atualizar dados
 * 5. ✅ Loading states e skeletons
 * 6. ✅ Badge indicando o modo atual
 * 7. ✅ Compatibilidade com dados iniciais (fallback)
 * 8. ✅ Callback de sucesso
 * 9. ✅ Normalização automática de dados
 * 10. ✅ Integração com hook atualizado
 */

export {};
