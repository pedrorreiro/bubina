import type { Metadata } from "next";
import { GlobalLoadingScreen } from "@/components/loading/GlobalLoadingScreen";

export const metadata: Metadata = {
  title: "Preview — Carregando | Bubina",
  robots: { index: false, follow: false },
};

export default function LoadingPreviewPage() {
  return <GlobalLoadingScreen />;
}
