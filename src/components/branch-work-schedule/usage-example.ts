// Exemplo de como usar o BranchWorkScheduleManager

/*
1. **Integração no componente de Branch (já feito):**

import { BranchWorkScheduleManager } from "@/components/branch-work-schedule/branch-work-schedule-manager";

// No JSX, dentro da seção de detalhes da branch:
<BranchWorkScheduleManager
  branchId={selectedBranch.id.toString()}
  branchName={selectedBranch.name}
  initialData={selectedBranch.work_schedule || []}
  services={
    Array.isArray(selectedBranch.services)
      ? selectedBranch.services.map(serviceId => {
          const service = services.find(s => s.id === serviceId);
          return service
            ? { id: service.id.toString(), name: service.name }
            : { id: serviceId.toString(), name: "Serviço" };
        })
      : []
  }
  onSuccess={() => {
    toast({
      title: "Horários atualizados",
      description: "Os horários da filial foram configurados com sucesso.",
    });
    // Recarregar dados da filial se necessário
    if (selectedBranch?.id) {
      handleSelectBranch(selectedBranch);
    }
  }}
  defaultView="view" // ou "edit"
/>

2. **Fluxo de uso:**

- O componente primeiro mostra uma aba "Visualizar" com os horários existentes
- Se não há horários, mostra um card vazio com botão para configurar
- Na aba "Configurar", o usuário pode:
  - Adicionar múltiplos horários por dia da semana
  - Configurar horário de início e fim (em intervalos de 15 min)
  - Aplicar horários de um dia para todos os outros dias
  - Selecionar fuso horário
  - Salvar as configurações

3. **API Backend:**

O componente usa:
- Hook: useBranchWorkSchedule
- Endpoint: POST /api/branch/{branch_id}/work_schedule
- Body: { work_schedule: { branch_work_ranges: [...] } }

4. **Estrutura de dados:**

BranchWorkScheduleRange {
  branch_id: string;
  start_time: string;  // "09:00"
  end_time: string;    // "17:00"
  time_zone: string;   // "America/Sao_Paulo"
  weekday: number;     // 0=domingo, 1=segunda, etc.
  services: object[];  // Serviços disponíveis neste horário
}

5. **Funcionalidades principais:**

✅ Configuração de horários por dia da semana
✅ Interface com tabs (Visualizar/Configurar)
✅ Copiar horários entre dias
✅ Validação de dados
✅ Estados de loading e error
✅ Toast notifications
✅ Integração com API backend
✅ TypeScript completo
✅ Design moderno com shadcn/ui

6. **Próximos passos para teste:**

1. Primeiro, criar um work_schedule para a branch usando o componente
2. Depois, criar work_schedule para employees da branch
3. Verificar se a dependência branch -> employee está funcionando

7. **Como encontrar o componente na UI:**

1. Vá para Dashboard > Branches
2. Selecione uma filial na sidebar
3. Na área de detalhes, após "Serviços vinculados", você verá a seção:
   "Horários da Filial - [Nome da Filial]"
4. Use as tabs "Visualizar" e "Configurar"
*/

export {};
