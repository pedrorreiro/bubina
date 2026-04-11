import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { SubscriptionService } from "@/services/subscription";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { priceType } = await req.json();

  if (priceType !== "monthly" && priceType !== "annual") {
    return NextResponse.json(
      { error: "Tipo de plano inválido" },
      { status: 400 }
    );
  }

  // Determinar URL base
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  try {
    const result = await SubscriptionService.createCheckoutSession(
      supabase,
      user.id,
      user.email!,
      priceType,
      baseUrl
    );

    return NextResponse.json(result);
  } catch (e) {
    const error = e as Error;
    console.error("❌ [Checkout] Erro:", error.message);
    return NextResponse.json(
      { error: error.message || "Erro ao criar checkout" },
      { status: 400 }
    );
  }
}
