import { Button } from "@/components/ui/button";

export  function IntegrationsSection() {
  return (
    <div className="space-y-4">
      <IntegrationButton
        title="Google Calendar"
        subtitle="Gmail, Google Workspace"
        icon="google"
      />
      <IntegrationButton
        title="Office 365 Calendar"
        subtitle="Office 365, Outlook, Hotmail"
        icon="microsoft"
      />
      <IntegrationButton
        title="Link your calendars"
        subtitle="Get a link to sync your Setmore calendar"
        icon="calendar"
      />
    </div>
  );
}

function IntegrationButton({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <Button variant="outline" className="flex items-center space-x-2">
        <span>Connect</span>
      </Button>
    </div>
  );
}
