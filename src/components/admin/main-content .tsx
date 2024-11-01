import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export const MainContent = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your team</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add member
        </Button>
      </div>
      <Input className="max-w-md" placeholder="Search" type="search" />
      <div className="mt-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium">V</span>
            </div>
            <div>
              <p className="font-medium">Vitor Augusto</p>
              <p className="text-sm text-muted-foreground">You</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
