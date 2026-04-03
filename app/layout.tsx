import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Dashboard UI | Newsprint Edition",
  description: "Frontend assignment dashboard with overview, charts, transactions, role simulation, and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
