import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ThemeProvider";
import { AuthProvider } from "../components/AuthProvider";
import { LearningProvider } from "../components/LearningProvider";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0`}>
        <ThemeProvider>
          <AuthProvider>
            <LearningProvider>
              {children}
            </LearningProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
