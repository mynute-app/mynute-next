import { ClockIcon, LinkIcon, MailIcon, PhoneIcon } from "lucide-react";

export const AboutSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <PhoneIcon className="w-5 h-5 text-gray-500" />
        <span>(11) 97135-1731</span>
      </div>
      <div className="flex items-center space-x-2">
        <MailIcon className="w-5 h-5 text-gray-500" />
        <span>vitoraugusto2010201078@gmail.com</span>
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
