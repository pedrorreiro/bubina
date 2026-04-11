import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { SubscriptionService } from "@/services/subscription";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { active: false, reason: "unauthenticated" },
        { status: 401 },
      );
    }

    // Usar o serviço centralizado
    const status = await SubscriptionService.getSubscription(supabase, user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error("❌ [API/Subscription] ERRO:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
