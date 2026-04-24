import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { PWAProvider } from "@/lib/pwa/PWAContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Laku POS - Point of Sale untuk Warung",
  description: "Aplikasi kasir modern untuk warung dan toko kecil Indonesia",
  manifest: "/manifest.json",
  icons: { icon: "/logo.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Laku POS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply theme class before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200`}
      >
        <PWAProvider>
          <ThemeProvider>
            <ToastProvider>
              <ErrorBoundary>
                <TRPCProvider>
                  <LanguageProvider>{children}</LanguageProvider>
                </TRPCProvider>
              </ErrorBoundary>
            </ToastProvider>
          </ThemeProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
