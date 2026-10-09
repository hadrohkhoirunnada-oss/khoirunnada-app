import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store";
import { GlobalLoadingProvider } from "@/lib/loading-context";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khoirunnada — Hadroh Management & Qosidah",
  description: "Aplikasi Operasional Internal & Qosidah Grup Hadroh Khoirunnada",
  icons: {
    icon: "/logo-khoirunnada-192.png",
    apple: "/logo-khoirunnada-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Khoirunnada",
  },
};

export const viewport: Viewport = {
  themeColor: "#996A19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${notoArabic.variable} min-h-screen flex flex-col bg-[#F8F6F0] text-[#151917] antialiased`} suppressHydrationWarning>
        <AppStoreProvider>
          <GlobalLoadingProvider>
            {children}
          </GlobalLoadingProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
