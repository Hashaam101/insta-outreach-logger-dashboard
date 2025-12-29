import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: 'swap',
});

import { TimeProvider, TimeFormat } from "@/components/time-context";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "InstaCRM Command Center",
  description: "Distributed Instagram Outreach Logger & CRM Dashboard",
  icons: {
    icon: "/logo.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const timeFormat = (cookieStore.get("time_display_format")?.value as TimeFormat) || "Ago";

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <TimeProvider initialFormat={timeFormat}>
          {children}
        </TimeProvider>
      </body>
    </html>
  );
}
