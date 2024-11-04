import { Button } from "@/components/ui/button";
import {
  Layout,
  Users,
  Calendar,
  Settings,
  Star,
  Download,
  Activity,
} from "lucide-react";
import Link from "next/link";

export const SettingsSubSidebar = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Layout className="h-4 w-4" />
          <Link href="/settings/your-brand">Your brand</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" />
          <Link href="/admin/settings/your-profile">Your profile</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" />
          <Link href="/admin/settings/your-team">Your team</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Calendar className="h-4 w-4" />
          <Link href="/settings/services">Services</Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          <Link href="/settings/general">General</Link>
        </Button>
      </div>

      <div className="pt-4">
        <p className="px-2 text-sm font-medium text-muted-foreground">MANAGE</p>
        <div className="pt-2 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Calendar className="h-4 w-4" />
            <Link href="/settings/booking-page">Booking Page</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            <Link href="/settings/branded-app">Your branded app</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Star className="h-4 w-4" />
            <Link href="/settings/payments">Payments</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Star className="h-4 w-4" />
            <Link href="/settings/reports">Reports</Link>
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <p className="px-2 text-sm font-medium text-muted-foreground">MORE</p>
        <div className="pt-2 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Download className="h-4 w-4" />
            <Link href="/settings/download-apps">Download apps</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Activity className="h-4 w-4" />
            <Link href="/settings/activity">Activity</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
