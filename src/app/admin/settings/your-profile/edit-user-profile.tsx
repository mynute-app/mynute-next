import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { UserProfile } from "./user-profile";

export const EditUserProfileDialog = ({
  user,
  onSave,
  isOpen,
  onClose,
}: {
  user: any;
  onSave: (updatedUser: any) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  useEffect(() => {
    // Simula chamada à API
    fetch("/api/user-profile")
      .then(res => res.json())
      .then(data => setFormData(data));
  }, []);

  const handleFormChange = (values: any) => {
    console.log("Form values updated:", values);
  };
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "",
    about: user?.about ?? "",
  });
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl" onEscapeKeyDown={onClose}>
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogClose asChild onClick={onClose}>
            <Button variant="ghost" className="absolute right-2 top-2"></Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex gap-8">
          {/* Lado esquerdo - Avatar e tabs */}
          <div className="flex flex-col items-start space-y-4 w-1/3">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
              {formData.fullName ? formData.fullName[0] : "?"}
            </div>
            <p className="text-lg font-semibold">{formData.fullName}</p>

            {/* Menu de abas */}
            <div className="flex flex-col space-y-2">
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "profile"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "working-hours"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("working-hours")}
              >
                Working hours
              </button>
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "breaks"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("breaks")}
              >
                Breaks
              </button>
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "time-off"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("time-off")}
              >
                Time off
              </button>
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "login-security"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("login-security")}
              >
                Login & security
              </button>
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "manage-account"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("manage-account")}
              >
                Manage your account
              </button>
            </div>
          </div>

          {/* Lado direito - Conteúdo das tabs */}
          <div className="w-2/3 space-y-6">
            {activeTab === "profile" && (
              <UserProfile
                initialData={formData}
                onFormChange={handleFormChange}
              />
            )}
            {activeTab === "working-hours" && (
              <div>
                <p>Configure working hours here.</p>
              </div>
            )}
            {activeTab === "breaks" && (
              <div>
                <p>Configure breaks here.</p>
              </div>
            )}
            {activeTab === "time-off" && (
              <div>
                <p>Configure time off here.</p>
              </div>
            )}
            {activeTab === "login-security" && (
              <div>
                <p>Configure login & security settings here.</p>
              </div>
            )}
            {activeTab === "manage-account" && (
              <div>
                <p>Manage your account settings here.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="ml-2">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
