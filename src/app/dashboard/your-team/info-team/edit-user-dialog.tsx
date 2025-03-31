import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function EditUserDialog({
  user,
  onSave,
  isOpen,
  onClose,
}: {
  user: any;
  onSave: (updatedUser: any) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "",
    about: user?.about ?? "",
  });

  const [activeTab, setActiveTab] = useState("profile"); // Tab ativa

  useEffect(() => {
    setFormData({
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "",
      about: user?.about ?? "",
    });
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl" onEscapeKeyDown={onClose}>
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogClose asChild onClick={onClose}>
            <Button
              variant="ghost"
              className="absolute right-2 top-2"
            ></Button>
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
              <div>
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-xs font-semibold text-gray-500"
                  >
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-semibold text-gray-500"
                    >
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+55"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold text-gray-500"
                    >
                      Primary email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="role"
                    className="text-xs font-semibold text-gray-500"
                  >
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Role"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="about"
                    className="text-xs font-semibold text-gray-500"
                  >
                    About
                  </Label>
                  <Textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    maxLength={6000}
                    placeholder="About you"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500">
                    {6000 - formData.about.length} characters remaining
                  </p>
                </div>
              </div>
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
          <Button onClick={handleSave} className="ml-2">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditUserDialog;
