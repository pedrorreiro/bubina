import { Header } from "@/components/layout/Header";
import { PaidPageBody } from "@/components/layout/PaidPageBody";
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
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <div
        className="app-shell-glow pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      />
      <Header />
      <main className="app-main mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col self-center">
        <PaidPageBody>{children}</PaidPageBody>
      </main>
    </div>
  );
}
