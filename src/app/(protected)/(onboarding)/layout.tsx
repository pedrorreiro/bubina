import { redirect } from "next/navigation";
import { getServerSession } from "@/services/session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loja } = await getServerSession();
  if (authenticated && loja) {
    redirect("/pedido");
  }

  return <>{children}</>;
}
