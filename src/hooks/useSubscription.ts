import { useState, useEffect, useCallback } from 'react';

export interface SubscriptionStatus {
  active: boolean;
  reason: 'trial' | 'paid' | 'expired' | 'no_store';
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
}

/**
 * Hook para gerenciar operações e estado de assinatura Stripe.
 * Centraliza chamadas aos endpoints e expõe o status atual mastigado.
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Verifica o status atual da assinatura */
  const refreshSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/subscription');
      
      if (!res.ok) {
        console.error(`Erro na API de assinatura: ${res.status}`);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados inicialmente
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  /** Cria uma sessão de checkout no Stripe e redireciona */
  const createCheckout = async (priceType: 'monthly' | 'annual') => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceType }),
    });

    const { url, error } = await res.json();
    if (error) throw new Error(error);
    if (url) window.location.href = url;
  };

  /** Abre o Stripe Customer Portal para gerenciar a assinatura */
  const openPortal = async () => {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
    });

    const { url, error } = await res.json();
    if (error) throw new Error(error);
    if (url) window.location.href = url;
  };

  return { 
    subscription, 
    isLoading, 
    refreshSubscription,
    createCheckout, 
    openPortal 
  };
}
