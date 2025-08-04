// Exemplo de como integrar o useWorkRangeServices no WorkRangeEditDialog

/*

1. **Import do hook:**

```tsx
import { useWorkRangeServices } from "@/hooks/workSchedule/use-work-range-services";
```

2. **Uso no componente:**

```tsx
export function WorkRangeEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
  disableWeekdayEdit = true,
  branchId, // Nova prop necessária
  workRangeId, // Nova prop necessária
}: WorkRangeEditDialogProps) {
  
  // Hook para gerenciar serviços
  const { 
    addServicesToWorkRange, 
    removeServiceFromWorkRange, 
    loading: servicesLoading 
  } = useWorkRangeServices({
    onSuccess: () => {
      // Atualizar dados após sucesso
      onSuccess?.();
    }
  });

  const handleSave = async () => {
    try {
      // 1. Salvar dados básicos (horários, etc.) - como já funciona
      const basicData = {
        start_time: formData.start_time,
        end_time: formData.end_time,
        weekday: formData.weekday,
        time_zone: formData.time_zone,
      };
      
      await onSave(basicData);

      // 2. Atualizar serviços separadamente
      if (formData.services.length > 0) {
        await addServicesToWorkRange(
          branchId,
          workRangeId,
          formData.services
        );
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };
}
```

3. **Fluxo de dados:**

- **Salvar horário:** Usa rota PUT `/work_range/{id}` (já existe)
- **Adicionar serviços:** Usa rota POST `/work_range/{id}/services` (nova)
- **Remover serviço:** Usa rota DELETE `/work_range/{id}/service/{service_id}` (nova)

4. **Funções disponíveis:**

```tsx
// Adicionar múltiplos serviços
await addServicesToWorkRange("branch-123", "work-range-456", ["service-1", "service-2"]);

// Remover serviço específico
await removeServiceFromWorkRange("branch-123", "work-range-456", "service-1");
```

5. **Estados do hook:**

- `loading`: Boolean - indica se operação está em andamento
- `success`: Boolean - indica se última operação foi bem-sucedida
- `error`: String | null - mensagem de erro se houver
- `reset()`: Function - limpa estados de success/error

6. **Integração com Toast:**

O hook já inclui notificações automáticas:
- ✅ "Serviços adicionados" em caso de sucesso
- ❌ "Erro ao adicionar serviços" em caso de erro
- ✅ "Serviço removido" em caso de sucesso
- ❌ "Erro ao remover serviço" em caso de erro

*/

export {};
