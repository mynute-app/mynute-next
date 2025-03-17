import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="container mx-auto flex items-center justify-between py-4">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl font-semibold text-[#1a2b47]">
          Agenda-kaki
        </span>
        <Image
          src="/auth-banner/logo2.webp"
          alt="Professionals using Setmore"
          width={50}
          height={50}
          className=""
          priority
        />
      </Link>
    </header>
  );
}
