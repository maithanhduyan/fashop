import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/navbar";
import ScrollToTop from "@/components/scroll-to-top";
import ChatWidget from "@/components/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fashop — Thời trang online",
  description: "Mua sắm thời trang nam nữ chất lượng cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 py-8">{children}</main>
          <ScrollToTop />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
