import { Header } from "@/components/layout/Header";
import { PaidLayoutShell } from "@/components/layout/PaidLayoutShell";
import { PaidMainColumn } from "@/components/layout/PaidMainColumn";
import { getServerSession } from "@/services/session";
import { redirect } from "next/navigation";

export default async function PaidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loja } = await getServerSession();

  if (!authenticated) {
    redirect("/login");
  }

  if (!loja) {
    redirect("/onboarding");
  }

  return (
    <PaidLayoutShell>
      <Header />
      <PaidMainColumn>{children}</PaidMainColumn>
    </PaidLayoutShell>
  );
}
