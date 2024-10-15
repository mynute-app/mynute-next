"use client";

import { useState } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BrandDetailsForm() {
  const [businessName, setBusinessName] = useState("Vitor");
  const [bookingUrl, setBookingUrl] = useState("vitordcx3");
  const [industry, setIndustry] = useState("Barbershop");

  return (
    <div className="container mx-auto ">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-6">Brand details</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Upload banner image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold">Brand logo</h3>
                <p className="text-sm text-gray-500">
                  Select a 200 x 200 px image, up to 10 MB in size
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Upload logo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingUrl">Your Booking Page URL</Label>
              <div className="flex">
                <Input
                  id="bookingUrl"
                  value={bookingUrl}
                  onChange={e => setBookingUrl(e.target.value)}
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  .setmore.com
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barbershop">Barbershop</SelectItem>
                  <SelectItem value="Salon">Salon</SelectItem>
                  <SelectItem value="Spa">Spa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                placeholder="Tell the world about your brand"
                className="h-32"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Preview</h2>
          <Card className="bg-gray-900 text-white">
            <CardHeader>
              <div className="w-full h-40 bg-gray-800 rounded-md mb-4"></div>
              <CardTitle>{businessName}</CardTitle>
              <CardDescription className="text-gray-400">
                https://{bookingUrl}.setmore.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="secondary">
                Book now
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need help with your Booking Page?</CardTitle>
              <CardDescription>
                We're real people here to help you 24/7
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>CB</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>ZD</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Connect with us
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
