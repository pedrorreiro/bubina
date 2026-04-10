/**
 * Lógica pura de cálculo de acesso.
 */
function calculateSubscriptionStatus(loja: any): any {
  if (!loja) {
    return { 
      active: false, 
      reason: 'no_store', 
      trialEndsAt: null, 
      subscriptionStatus: null,
      isCanceling: false 
    };
  }

  // 1. Check for manual override (Lifetime/Manual access)
  if (loja.is_premium) {
    return {
      active: true,
      reason: 'manual',
      trialEndsAt: null,
      subscriptionStatus: 'active',
      isCanceling: false
    };
  }

  const now = new Date();
  const trialEndsAt = loja.trial_ends_at ? new Date(loja.trial_ends_at) : null;
  const isCanceling = !!loja.is_canceling;
  
  const inTrial = trialEndsAt ? trialEndsAt > now : false;
  if (inTrial) {
    return {
      active: true,
      reason: 'trial',
      trialEndsAt: loja.trial_ends_at,
      subscriptionStatus: loja.subscription_status,
      isCanceling
    };
  }

  const periodEnd = loja.current_period_end ? new Date(loja.current_period_end) : null;
  const isPaid = loja.subscription_status === 'active' || loja.subscription_status === 'past_due';
  
  // VERIFICAÇÃO RÍGIDA DE TEMPO: Só está ativo se o status for pago E a data de expiração não passou
  const isSubscriptionValid = isPaid && (periodEnd ? periodEnd > now : true);

  if (isSubscriptionValid) {
    return {
      active: true,
      reason: 'paid',
      trialEndsAt: loja.trial_ends_at,
      currentPeriodEnd: loja.current_period_end,
      subscriptionStatus: loja.subscription_status,
      isCanceling
    };
  }

  return {
    active: false,
    reason: 'expired',
    trialEndsAt: loja.trial_ends_at,
    currentPeriodEnd: loja.current_period_end,
    subscriptionStatus: loja.subscription_status,
    isCanceling
  };
}

/**
 * ÚNICA fonte da verdade para buscar e calcular o status de uma assinatura.
 */
export async function getSubscription(supabase: any, userId: string): Promise<any> {
  try {
    console.log(`📡 [Logic] Iniciando query para user: ${userId}`);
    const { data: loja, error: dbError } = await supabase
      .from('lojas')
      .select('trial_ends_at, subscription_status, is_premium, is_canceling, current_period_end')
      .eq('user_id', userId)
      .maybeSingle();

    if (dbError) {
      console.error('❌ [Logic] Erro banco:', dbError);
      return { active: false, reason: 'expired', isCanceling: false };
    }

    console.log('📊 [Logic] Dados do banco recebidos, calculando...');
    return calculateSubscriptionStatus(loja);
  } catch (error) {
    console.error('❌ [Logic] Erro fatal interno:', error);
    throw error;
  }
}
