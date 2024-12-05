import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const UserProfile = () => {
    
    return (
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
          <Label htmlFor="role" className="text-xs font-semibold text-gray-500">
            Role
          </Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
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
            maxLength={6000}
            placeholder="About you"
            className="mt-1"
          />
          <p className="text-xs text-gray-500">
            {6000 - formData.about.length} characters remaining
          </p>
        </div>
      </div>
    );
};