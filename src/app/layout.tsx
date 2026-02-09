import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/context/AppDataContext";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily habits, build streaks, and visualize your progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AppDataProvider>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
