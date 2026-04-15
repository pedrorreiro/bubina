import { redirect } from "next/navigation";
import LandingPage from "@/components/marketing/LandingPage";
import { getServerSession } from "@/services/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { authenticated } = await getServerSession();

  if (authenticated) {
    redirect("/pedido");
  }

  return <LandingPage />;
}
