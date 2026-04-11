import { createClient } from "@/lib/supabase-server";
import { SubscriptionService } from "@/services/subscription";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar assinatura para criação de produtos
  const subscription = await SubscriptionService.getSubscription(
    supabase,
    user.id,
  );
  if (!subscription.active) {
    return NextResponse.json(
      {
        error: "Assinatura necessária para adicionar produtos ao catálogo.",
        code: "SUBSCRIPTION_REQUIRED",
      },
      { status: 402 },
    );
  }

  const { nome, preco } = await req.json();

  const { data, error } = await supabase
    .from("produtos")
    .insert({
      user_id: user.id,
      nome,
      preco,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
