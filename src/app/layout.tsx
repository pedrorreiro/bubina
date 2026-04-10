import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../context/ToastContext";
import { AppProvider } from "../context/AppContext";

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
  weight: ["400", "500", "600", "700", "800"],
});

const jbm = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbm",
});

export const metadata: Metadata = {
  title: "Thermal Pro | PDV Inteligente",
  description: "Sistema de frente de caixa para impressoras térmicas",
};

export const viewport: Viewport = {
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
    <html lang="pt-BR">
      <body
        className={`${pjs.variable} ${jbm.variable} font-sans antialiased bg-bg text-text`}
      >
        <ToastProvider>
          <AppProvider>{children}</AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
