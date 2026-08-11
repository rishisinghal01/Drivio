import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Provider from "@/lib/Provider"
import ReduxProvider from "@/redux/ReduxProvider";
import { SocketProvider } from "@/components/SocketProvider";
import Inituser from "@/Inituser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drivio - Smart Vehicle Booking Platform",
  description: "Drivio ek modern multi-vendor vechile booking platform hai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          <SocketProvider>
            <ReduxProvider>
               <Inituser/>
              {children}
            </ReduxProvider>
          </SocketProvider>
        </Provider>
      </body>
    </html>
  );
}
