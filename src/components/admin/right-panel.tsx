import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronDown, Mail, Phone } from "lucide-react";

export const RightPanel = () => {
    return (
      <div className="border-l p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-medium">V</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Vitor Augusto</h2>
            <p className="text-sm text-muted-foreground">
              Sorocaba, SP, BR • 11:43 AM
            </p>
          </div>
        </div>

        <Tabs defaultValue="about" className="mb-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>(11) 97135-1731</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">vitoraugusto201020107@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Today • 9:00 AM - 5:00 PM</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
}