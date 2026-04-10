import { createClient } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o stripe_subscription_id do usuário na tabela lojas
    const { data: loja, error: dbError } = await supabase
      .from('lojas')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError || !loja?.stripe_subscription_id) {
      return NextResponse.json({ 
        error: 'Nenhuma assinatura ativa encontrada para este usuário.' 
      }, { status: 404 });
    }

    // Solicitar o cancelamento ao final do período no Stripe
    const subscription = await stripe.subscriptions.update(
      loja.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    // Atualizar o banco de dados para refletir o estado de cancelamento pendente
    await supabase
      .from('lojas')
      .update({ is_canceling: true })
      .eq('user_id', user.id);

    console.log(`✅ [Stripe/Cancel] Assinatura ${subscription.id} marcada para cancelamento.`);

    return NextResponse.json({ 
      success: true, 
      message: 'Sua assinatura foi cancelada e não será renovada. Você manterá o acesso até o final do período atual.',
      cancelAt: subscription.cancel_at
    });

  } catch (error: any) {
    console.error('💥 [Stripe/Cancel] ERRO:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao processar o cancelamento.' 
    }, { status: 500 });
  }
}
