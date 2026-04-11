import { redirect } from "next/navigation";
import { getServerSession } from "@/services/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated } = await getServerSession();

  if (!authenticated) {
    redirect("/login");
  }

  return <>{children}</>;
}
