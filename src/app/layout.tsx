import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppProvider } from "../context/AppContext";
import { Provider } from "@/components/ui/provider";

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
  title: "Bubina — PDV Inteligente para Impressoras Térmicas",
  description:
    "Imprima cupons direto do celular via Bluetooth. Sem fio, sem complicação.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="pt-BR">
      <body className={`${pjs.variable} ${jbm.variable}`}>
        <Provider>
          <Toaster
            position="bottom-right"
            richColors
            theme="dark"
            closeButton
          />
          <AppProvider>{children}</AppProvider>
        </Provider>
      </body>
    </html>
  );
}
