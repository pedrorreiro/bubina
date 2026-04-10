import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { authenticated: false, user: null, hasLoja: false, subscription: null },
      { status: 401 },
    );
  }

  // Obter status da assinatura via Serviço Centralizado
  const subscription = await SubscriptionService.getSubscriptionStatus(supabase, user.id);

  return NextResponse.json({
    authenticated: true,
    hasLoja: subscription.reason !== 'no_store',
    user: {
      id: user.id,
      email: user.email,
    },
    subscription,
  });
}
