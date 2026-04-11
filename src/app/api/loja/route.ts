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
    .from("lojas")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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

  const loja = await req.json();

  // Buscar registro atual para comparar a logo e preservar o trial
  const { data: currentLoja } = await supabase
    .from("lojas")
    .select("logo_url, trial_ends_at, mensagem_rodape")
    .eq("user_id", user.id)
    .maybeSingle();

  // Verificar se está tentando mudar a logo ou o rodapé
  const isChangingLogo = 
    loja.logo_url !== currentLoja?.logo_url;
  const isChangingRodape =
    loja.mensagem_rodape !== currentLoja?.mensagem_rodape;

  if (isChangingLogo || isChangingRodape) {
    const subscription = await SubscriptionService.getSubscription(
      supabase,
      user.id,
    );
    if (!subscription.active) {
      const field = isChangingLogo ? "logomarca" : "mensagem de rodapé";
      return NextResponse.json(
        {
          error: `Assinatura necessária para alterar a ${field} do cupom.`,
          code: "SUBSCRIPTION_REQUIRED",
        },
        { status: 402 },
      );
    }
  }

  // Preservar trial existente ou criar um novo se for a primeira vez
  const trialEndsAt =
    currentLoja?.trial_ends_at ||
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("lojas")
    .upsert(
      {
        user_id: user.id,
        nome: loja.nome,
        telefone: loja.telefone,
        endereco: loja.endereco,
        logo_url: loja.logo_url,
        logo_metodo: loja.logo_metodo,
        mensagem_rodape: loja.mensagem_rodape,
        trial_ends_at: trialEndsAt,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
