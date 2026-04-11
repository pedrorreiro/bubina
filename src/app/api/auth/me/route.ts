import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth";
import { StoreService } from "@/services/store";
import { SubscriptionService } from "@/services/subscription";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const user = await AuthService.getUser();

  if (!user) {
    return NextResponse.json(
      { authenticated: false, user: null, loja: null, subscription: null },
      { status: 401 },
    );
  }

  const loja = await StoreService.getStoreByUserId(user.id);

  // Status da Assinatura
  const supabase = await createClient();
  const subscription = await SubscriptionService.getSubscription(
    supabase,
    user.id,
  );

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    loja,
    subscription,
  });
}
