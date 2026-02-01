import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import { AuthProvider } from "../components/AuthProvider";
import { LearningProvider } from "../components/LearningProvider";
import FooterWrapper from "../components/FooterWrapper";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Tutor AI",
  description: "Your AI-powered learning companion",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartUtor"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 flex flex-col min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <LearningProvider>
              <ServiceWorkerRegister />
              <div className="flex-grow">
                {children}
              </div>
              <FooterWrapper />
            </LearningProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
