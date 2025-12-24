import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prompt Pro | AI Prompt Engineering & Optimization Tool",
  description: "Stop using weak prompts. Optimize your inputs for ChatGPT, Claude, and Gemini with our professional AI prompt engineering tool. Trusted by 12,000+ creators.",
  keywords: ["prompt engineering", "AI optimizer", "ChatGPT prompts", "Claude prompts", "Prompt Pro"],
  authors: [{ name: "Prompt Pro Team" }],
  openGraph: {
    title: "Prompt Pro - Professional AI Prompt Optimizer",
    description: "Get perfect AI results instantly. Join 12,000+ users optimizing their prompts for free.",
    url: "https://promptpro.dev",
    siteName: "Prompt Pro",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Pro - AI Prompt Optimizer",
    description: "Get perfect AI results instantly. 1 Month Premium Free.",
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
