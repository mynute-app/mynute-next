// components/YourTeam.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  LinkIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import AddTeamMemberDialog from "./add-team-member-modal";

type TeamMember = {
  id: number;
  name: string;
  status: string;
  role: string;
};

const teamMembers: TeamMember[] = [
  { id: 1, name: "Vitor Augusto", status: "You", role: "Active" },
  { id: 2, name: "Augusto", status: "Pending", role: "Inactive" },
];

export default function YourTeam() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(
    teamMembers[0]
  );
  const [activeTab, setActiveTab] = useState("about");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setActiveTab("about");
  };

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 p-4 border-r">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Team</h2>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 pl-10 rounded border border-gray-300"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
        </div>

        {/* Team List */}
        <ul className="space-y-2">
          {teamMembers.map(member => (
            <li
              key={member.id}
              className={`p-2 rounded cursor-pointer ${
                selectedMember?.id === member.id
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleSelectMember(member)}
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center font-bold text-gray-700">
                  {member.name[0]}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.status}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail View */}
      <div className="w-2/3 p-6">
        {selectedMember ? (
          <>
            <div className="flex items-center space-x-4 mb-6">
              <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center text-xl font-bold">
                V
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Vitor Augusto</h1>
                <p className="text-gray-500">Sorocaba, SP, BR • 3:18 PM</p>
              </div>
            </div>
            <h1 className="text-2xl font-semibold">{selectedMember.name}</h1>
            <p className="text-gray-500">{selectedMember.role}</p>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mt-4 mb-4">
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

            {/* Tab Content */}
            <div>{renderTabContent()}</div>
          </>
        ) : (
          <p>Select a team member to view details</p>
        )}
      </div>

      {/* Dialog for Adding Team Member */}
      <AddTeamMemberDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}

// Seções individuais

function AboutSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <PhoneIcon className="w-5 h-5 text-gray-500" />
        <span>(11) 97135-1731</span>
      </div>
      <div className="flex items-center space-x-2">
        <MailIcon className="w-5 h-5 text-gray-500" />
        <span>example@gmail.com</span>
      </div>
      <div className="flex items-center space-x-2">
        <ClockIcon className="w-5 h-5 text-gray-500" />
        <span>Today • 9:00 AM - 5:00 PM (HPDB)</span>
      </div>
      <div className="flex items-center space-x-2">
        <LinkIcon className="w-5 h-5 text-gray-500" />
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          https://example.com
        </a>
      </div>
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
