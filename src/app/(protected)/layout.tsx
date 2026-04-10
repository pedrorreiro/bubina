import { redirect } from "next/navigation";
import { useServerAuth } from "@/services/auth-server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getMe } = await useServerAuth();
  const { authenticated } = await getMe();

  if (!authenticated) {
    redirect("/login");
  }

  return <>{children}</>;
}
