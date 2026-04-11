import { Header } from "@/components/layout/Header";
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
    <>
      <Header />
      <main className="container mx-auto max-w-7xl pt-20 pb-24 md:pt-24 md:pb-12 px-4 md:px-8">
        {children}
      </main>
    </>
  );
}
