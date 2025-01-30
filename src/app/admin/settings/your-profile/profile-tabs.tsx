// components/ProfileTabs.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClockIcon, LinkIcon, MailIcon, PhoneIcon } from "lucide-react";
import { MdOutlineModeEdit } from "react-icons/md";
import { EditUserProfileDialog } from "./edit-user-profile";
import { useSession } from "next-auth/react";
import { AboutSection } from "./about-section";

interface User {
  name: string;
  email: string;
  phone: string;
}

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("about");
  const { data: session } = useSession();

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutSection />;
      case "integrations":
        return <IntegrationsSection />;
      case "services":
        return <ServicesSection />;
      case "working-hours":
        return <WorkingHoursSection />;
      case "breaks":
        return <BreaksSection />;
      default:
        return null;
    }
  };
  const [activeModal, setActiveModal] = useState(false);

  return (
    <div className="container mx-auto p-6 mt-4">
      <div className="flex items-center space-x-4 mb-6 justify-between bg-amber-400">
        <div className="">
          <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center text-xl font-bold">
            V
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{session?.user.name}</h1>
            <p className="text-gray-500">Sorocaba, SP, BR • 3:18 PM</p>
          </div>
        </div>
        <div onClick={() => setActiveModal(true)}>
          <MdOutlineModeEdit className="size-5 self-start mt-4 cursor-pointer" />
        </div>
      </div>

      <div className="flex space-x-4 border-b mb-4 ">
        <button
          onClick={() => setActiveTab("about")}
          className={`py-2 ${
            activeTab === "about" ? "border-b-2 border-black" : ""
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`py-2 ${
            activeTab === "integrations" ? "border-b-2 border-black" : ""
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`py-2 ${
            activeTab === "services" ? "border-b-2 border-black" : ""
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab("working-hours")}
          className={`py-2 ${
            activeTab === "working-hours" ? "border-b-2 border-black" : ""
          }`}
        >
          Working hours
        </button>
        <button
          onClick={() => setActiveTab("breaks")}
          className={`py-2 ${
            activeTab === "breaks" ? "border-b-2 border-black" : ""
          }`}
        >
          Breaks
        </button>
      </div>
      {/* <EditUserProfileDialog
        isOpen={activeModal}
        onClose={() => setActiveModal(false)}
        user={() => {}}
        onSave={() => {}}
      /> */}
      <div className=" w-2/3">{renderTabContent()}</div>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-4">
      <IntegrationButton
        title="Google Calendar"
        subtitle="Gmail, Google Workspace"
        icon="google"
      />
      <IntegrationButton
        title="Office 365 Calendar"
        subtitle="Office 365, Outlook, Hotmail"
        icon="microsoft"
      />
      <IntegrationButton
        title="Link your calendars"
        subtitle="Get a link to sync your Setmore calendar"
        icon="calendar"
      />
    </div>
  );
}

function IntegrationButton({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <Button variant="outline" className="flex items-center space-x-2">
        {icon === "google" && <ClockIcon className="w-5 h-5" />}
        {icon === "microsoft" && <ClockIcon className="w-5 h-5" />}
        {icon === "calendar" && <ClockIcon className="w-5 h-5" />}
        <span>Connect</span>
      </Button>
    </div>
  );
}

function ServicesSection() {
  const services = [
    { title: "15 Minutes Meeting", duration: "15 mins • Free" },
    { title: "30 Minutes Meeting", duration: "30 mins • Free" },
    { title: "1 Hour Meeting", duration: "60 mins • Free" },
  ];

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <div key={index} className="p-4 border rounded-lg flex justify-between">
          <div>
            <p className="font-semibold">{service.title}</p>
            <p className="text-sm text-gray-500">{service.duration}</p>
          </div>
          <Button variant="outline">Share</Button>
        </div>
      ))}
    </div>
  );
}

function WorkingHoursSection() {
  const workingHours = [
    { day: "Monday", hours: "9:00 AM - 5:00 PM" },
    { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
    { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
    { day: "Friday", hours: "9:00 AM - 5:00 PM" },
    { day: "Saturday", hours: "Add hours" },
    { day: "Sunday", hours: "Add hours" },
  ];

  return (
    <div className="space-y-4">
      {workingHours.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <p>{item.day}</p>
          <p className="text-gray-500">{item.hours}</p>
        </div>
      ))}
    </div>
  );
}

function BreaksSection() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return (
    <div className="space-y-4">
      {days.map((day, index) => (
        <div key={index} className="flex items-center justify-between">
          <p>{day}</p>
          <Button variant="outline">Add break</Button>
        </div>
      ))}
    </div>
  );
}
