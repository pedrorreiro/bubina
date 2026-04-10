import { redirect } from "next/navigation";
import { useServerAuth } from "@/services/auth-server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getMe } = await useServerAuth();
  const { authenticated, hasLoja } = await getMe();

  if (authenticated && hasLoja) {
    redirect("/pedido");
  }

  return <>{children}</>;
}
