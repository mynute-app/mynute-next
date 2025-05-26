import { ClockIcon, LinkIcon, MailIcon, PhoneIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "../../../../../types/user";

export const AboutSection = ({
  user,
  loading,
}: {
  user: User;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[40, 60, 48, 52].map((width, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className={`h-5 w-${width}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <PhoneIcon className="w-5 h-5 text-gray-500" />
        <span>{user.phone || "Telefone não cadastrado"}</span>
      </div>
      <div className="flex items-center space-x-2">
        <MailIcon className="w-5 h-5 text-gray-500" />
        <span>{user.email || "Email não disponível"}</span>
      </div>
      <div className="flex items-center space-x-2">
        <ClockIcon className="w-5 h-5 text-gray-500" />
        <span>Today • 9:00 AM - 5:00 PM (HPDB)</span>
      </div>
      <div className="flex items-center space-x-2">
        <LinkIcon className="w-5 h-5 text-gray-500" />
        <a
          href="https://vitordcx3.setmore.com/vitor"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://vitordcx3.setmore.com/vitor
        </a>
      </div>
    </div>
  );
};
