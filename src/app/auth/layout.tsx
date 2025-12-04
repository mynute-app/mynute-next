export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-white to-sky-100 ">
      <main>{children}</main>
    </div>
  );
}
