import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'TireNearBy.com – AI Tire Co‑Pilot',
  description: 'TireNearBy.com: Scan a tire sidewall and instantly see size, spec & find nearby shops with confidence.',
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>        
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-white to-zinc-100 text-zinc-900">
          <div className="border-b border-transparent/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
            <SiteHeader />
          </div>
            <main className="relative flex-1 w-full mx-auto max-w-6xl px-5 pt-0 pb-6">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
