import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Briefcase,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDetails {
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  staffName: string;
  date: Date;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

interface BookingConfirmationProps {
  booking: BookingDetails;
  businessName?: string;
  businessAddress?: string;
}

export const BookingConfirmation = ({ 
  booking, 
  businessName = "Seu Negócio",
  businessAddress 
}: BookingConfirmationProps) => {
  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-in">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-foreground">Agendamento Confirmado!</h2>
        <p className="text-muted-foreground mt-2">
          Você receberá uma confirmação por WhatsApp
        </p>
      </div>

      {/* Booking details card */}
      <div className="bg-card rounded-2xl border p-5 text-left space-y-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Serviço</p>
            <p className="font-medium text-foreground">{booking.serviceName}</p>
            <p className="text-sm text-primary font-medium mt-0.5">
              R$ {booking.servicePrice.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data e horário</p>
            <p className="font-medium text-foreground">
              {format(booking.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{booking.time} • {booking.serviceDuration} min</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profissional</p>
            <p className="font-medium text-foreground">
              {booking.staffName === "any" ? "Primeiro disponível" : booking.staffName}
            </p>
          </div>
        </div>

        {businessAddress && (
          <>
            <div className="h-px bg-border" />
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium text-foreground">{businessName}</p>
                <p className="text-sm text-muted-foreground">{businessAddress}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customer info */}
      <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Dados do cliente
        </p>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{booking.customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{booking.customerPhone}</span>
        </div>
        {booking.customerEmail && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{booking.customerEmail}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Guarde este comprovante. Em caso de dúvidas, entre em contato conosco.
      </p>
    </div>
  );
};
