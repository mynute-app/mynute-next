// components/AddTeamMemberDialog.tsx
import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddTeamMemberDialog({
  isOpen,
  setIsOpen,
}: AddTeamMemberDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="backdrop-blur-md">
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogDescription>
          Fill out the details below to add a new team member.
        </DialogDescription>
        <form>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded border-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Permission level
              </label>
              <select className="w-full p-2 border rounded border-gray-300">
                <option>No access</option>
                <option>Read only</option>
                <option>Edit</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button  type="submit">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
