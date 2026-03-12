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
  title: {
    default: "Fashop — Thời trang online",
    template: "%s | Fashop",
  },
  description:
    "Fashop — Cửa hàng thời trang online: áo nam, quần nam, áo nữ, váy đầm, giày dép, túi xách & phụ kiện. Miễn phí giao hàng đơn từ 500K, đổi trả 30 ngày.",
  keywords: [
    "thời trang",
    "fashop",
    "mua sắm online",
    "áo nam",
    "quần nam",
    "áo nữ",
    "váy đầm",
    "giày dép",
    "túi xách",
    "thời trang Việt Nam",
  ],
  authors: [{ name: "Fashop" }],
  creator: "Fashop",
  metadataBase: new URL("https://fashop.vn"),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://fashop.vn",
    siteName: "Fashop",
    title: "Fashop — Thời trang online chất lượng cao",
    description:
      "Khám phá bộ sưu tập thời trang mới nhất. Miễn phí giao hàng cho đơn từ 500K, đổi trả 30 ngày.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Fashop — Thời trang online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashop — Thời trang online",
    description: "Khám phá bộ sưu tập thời trang mới nhất tại Fashop.",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop&q=80",
    ],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 py-6 sm:py-8">{children}</main>
          <ScrollToTop />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
