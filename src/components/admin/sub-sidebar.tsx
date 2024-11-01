import { Button } from "@/components/ui/button";
import {
  Calendar,
  Layout,
  Users,
  CreditCard,
  PieChart,
  FileText,
  Bell,
  Star,
  Download,
  Activity,
  ChevronDown,
  AppWindow,
} from "lucide-react";

export const SubSidebar = () => {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2 pb-4">
        <span className="font-semibold text-lg">Settings</span>
      </div>
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Layout className="h-4 w-4" />
          Your brand
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" />
          Your team
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Calendar className="h-4 w-4" />
          Services
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <FileText className="h-4 w-4" />
          General
        </Button>
      </div>
      <div className="pt-4">
        <p className="px-2 text-sm font-medium text-muted-foreground">MANAGE</p>
        <div className="pt-2 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Calendar className="h-4 w-4" />
            Booking Page
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <AppWindow className="h-4 w-4" />
            Your branded app
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <PieChart className="h-4 w-4" />
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Billing
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </Button>
        </div>
      </div>
      <div className="pt-4">
        <p className="px-2 text-sm font-medium text-muted-foreground">MORE</p>
        <div className="pt-2 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Download className="h-4 w-4" />
            Download apps
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </Button>
        </div>
      </div>
    </div>
  );
};
