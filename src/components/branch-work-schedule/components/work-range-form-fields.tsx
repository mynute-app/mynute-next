import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "./time-picker";
import { DIAS_SEMANA, TIMEZONES } from "../constants";

interface WorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
  services: string[];
}

interface WorkRangeFormFieldsProps {
  formData: any;
  disableWeekdayEdit: boolean;
  updateField: (field: keyof WorkRangeEditData, value: any) => void;
  handleOverlayOpenChange: (open: boolean) => void;
}

export function WorkRangeFormFields({
  formData,
  disableWeekdayEdit,
  updateField,
  handleOverlayOpenChange,
}: WorkRangeFormFieldsProps) {
  return (
    <div className="grid gap-4 py-4">
      <FormField label="Dia da Semana">
        {disableWeekdayEdit ? (
          <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
            {DIAS_SEMANA.find(dia => dia.weekday === formData.weekday)?.label ||
              "Indefinido"}
          </div>
        ) : (
          <Select
            value={formData.weekday.toString()}
            onValueChange={value => updateField("weekday", parseInt(value))}
            onOpenChange={handleOverlayOpenChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              {DIAS_SEMANA.map(dia => (
                <SelectItem key={dia.weekday} value={dia.weekday.toString()}>
                  {dia.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      <FormField label="Fuso Horário">
        <Select
          value={formData.time_zone}
          onValueChange={value => updateField("time_zone", value)}
          onOpenChange={handleOverlayOpenChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[10000]">
            {TIMEZONES.map(tz => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Início">
        <TimePicker
          value={formData.start_time}
          onChange={value => updateField("start_time", value)}
          label="Horário de Início"
        />
      </FormField>

      <FormField label="Fim">
        <TimePicker
          value={formData.end_time}
          onChange={value => updateField("end_time", value)}
          label="Horário de Término"
        />
      </FormField>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

const FormField = ({ label, children }: FormFieldProps) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label className="text-right">{label}</Label>
    <div className="col-span-3">{children}</div>
  </div>
);
