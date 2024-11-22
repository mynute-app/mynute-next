"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BsPlus } from "react-icons/bs";
import {
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiTag,
  FiLock,
  FiImage,
} from "react-icons/fi";

export const AddServiceDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 text-white h-10 w-10 bg-primary rounded-full flex justify-center items-center shadow-md"
        >
          <BsPlus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Create new service</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new service.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form className="space-y-4">
          {/* Service Title */}
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <FiImage className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <Label htmlFor="title">Enter service title*</Label>
              <Input id="title" placeholder="Enter service title" />
              <p className="text-sm text-muted-foreground mt-1">Description</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5" />
            <div className="flex-1">
              <Label htmlFor="duration">Duration*</Label>
              <Input id="duration" placeholder="e.g., 30 mins" />
            </div>
          </div>

          {/* Buffer Time */}
          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5" />
            <div className="flex-1">
              <Label htmlFor="buffer">Buffer time</Label>
              <Input id="buffer" placeholder="e.g., 10 mins" />
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-gray-500 w-5 h-5" />
            <div className="flex-1">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" placeholder="e.g., $50" />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <FiMapPin className="text-gray-500 w-5 h-5" />
            <div className="flex-1">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Online" />
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center gap-3">
            <FiTag className="text-gray-500 w-5 h-5" />
            <div className="flex-1">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category1">Category 1</SelectItem>
                  <SelectItem value="category2">Category 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hidden */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiLock className="text-gray-500 w-5 h-5" />
              <Label htmlFor="hidden">Set to hidden</Label>
            </div>
            <Switch id="hidden" />
          </div>
        </form>

        {/* Footer Buttons */}
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
