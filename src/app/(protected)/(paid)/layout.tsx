import { Header } from "@/components/layout/Header";
import { useServerAuth } from "@/services/auth-server";
import { redirect } from "next/navigation";

export default async function PaidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getMe } = await useServerAuth();
  const { authenticated, hasLoja } = await getMe();

  /**
   * NOTA: A segurança de assinatura (Trial/Pago) agora é gerida centralmente
   * pelo Middleware (src/middleware.ts), seguindo as boas práticas do Next.js.
   * Isso garante verificação em tempo real em cada clique e proteção de APIs.
   */

  if (!authenticated) {
    redirect("/login");
  }

  if (!hasLoja) {
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
