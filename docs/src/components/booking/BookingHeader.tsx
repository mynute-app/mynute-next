import { cn } from "@/lib/utils";

interface BookingHeaderProps {
  businessName?: string;
  businessLogo?: string;
  className?: string;
}

export const BookingHeader = ({ 
  businessName = "Seu Negócio", 
  businessLogo,
  className 
}: BookingHeaderProps) => {
  return (
    <header className={cn("w-full py-4 px-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50", className)}>
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        {businessLogo ? (
          <img src={businessLogo} alt={businessName} className="h-10 w-10 rounded-lg object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              {businessName.charAt(0)}
            </span>
          </div>
        )}
        <h1 className="font-semibold text-foreground">{businessName}</h1>
      </div>
    </header>
  );
};
