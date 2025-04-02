import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="border-b-2 border-white pb-4 font-medium">
              Services
            </Link>
            <Link href="#" className="text-zinc-400 pb-4 font-medium">
              Team
            </Link>
            <Link href="#" className="text-zinc-400 pb-4 font-medium">
              Reviews
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <nav className="flex md:hidden space-x-6">
            <Link href="#" className="border-b-2 border-white pb-1 font-medium">
              Services
            </Link>
            <Link href="#" className="text-zinc-400 pb-1 font-medium">
              Team
            </Link>
            <Link href="#" className="text-zinc-400 pb-1 font-medium">
              Reviews
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-upload"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </Button>
            <div className="hidden md:flex items-center">
              <span className="text-zinc-400">v</span>
              <span className="ml-2">Profile</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-more-vertical"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:flex md:gap-8">
        {/* Left Column - Services and Team */}
        <div className="md:w-2/3">
          {/* Mobile Profile Header */}
          <div className="md:hidden mb-6">
            <h1 className="text-2xl font-bold mb-2">Vitor</h1>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>9 AM — 5 PM</span>
              <span className="flex items-center ml-2">
                Open now
                <ChevronDown className="h-4 w-4 ml-1" />
              </span>
            </div>
          </div>

          {/* Services Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Services</h2>
            <div className="space-y-3">
              <Link href="/agendar/sobrancelha">
                <Card className="bg-zinc-900 border-zinc-800 p-4 flex justify-between items-center hover:bg-zinc-800 transition-colors">
                  <div>
                    <h3 className="font-medium">Sobrancelha</h3>
                    <p className="text-sm text-zinc-400">10 mins · R$20</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </Card>
              </Link>
              <Link href="/agendar/testador">
                <Card className="bg-zinc-900 border-zinc-800 p-4 flex justify-between items-center hover:bg-zinc-800 transition-colors">
                  <div>
                    <h3 className="font-medium">Testador</h3>
                    <p className="text-sm text-zinc-400">20 mins · R$50</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </Card>
              </Link>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Team</h2>
            <div className="space-y-3">
              <Card className="bg-zinc-900 border-zinc-800 p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 bg-zinc-800">
                    <AvatarFallback>V</AvatarFallback>
                  </Avatar>
                  <span>Vitor Augusto</span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </Card>
              <Card className="bg-zinc-900 border-zinc-800 p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 bg-zinc-800">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <span>Augusto</span>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </Card>
            </div>
          </section>

          {/* Good to know Section - Only visible on desktop */}
          <section className="hidden md:block mb-8">
            <h2 className="text-xl font-bold mb-4">Good to know</h2>
            <div className="flex items-center text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <span className="underline">Booking policy</span>
            </div>
          </section>

          {/* Mobile Book Button */}
          <div className="md:hidden flex justify-center mt-6">
            <Button className="w-full max-w-xs rounded-full bg-white text-black hover:bg-zinc-200">
              Book
            </Button>
          </div>
        </div>

        {/* Right Column - Profile and Hours (Desktop only) */}
        <div className="hidden md:block md:w-1/3">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h1 className="text-2xl font-bold mb-6">Vitor</h1>

            <div className="mb-6">
              <Button className="w-full rounded-full bg-white text-black hover:bg-zinc-200">
                Book
              </Button>
            </div>

            <div className="flex items-center text-sm mb-6">
              <Clock className="h-4 w-4 mr-1" />
              <span>Open now</span>
              <ChevronDown className="h-4 w-4 ml-1" />
              <span className="ml-2">9 AM — 5 PM</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Sunday</span>
                <span>Closed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Monday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tuesday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Wednesday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Thursday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Friday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Saturday</span>
                <span>Closed</span>
              </div>
              <div className="text-xs text-zinc-500 mt-4">
                Time zone (Brasília Standard Time)
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
