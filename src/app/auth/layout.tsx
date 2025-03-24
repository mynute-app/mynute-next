import { SessionProvider } from "next-auth/react";
import Header from "./_components/header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-white to-sky-100 ">
      {/* <Header /> */}
      <main>{children}</main>
    </div>
  ); 
}
