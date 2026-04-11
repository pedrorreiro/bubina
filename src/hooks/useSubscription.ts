import { useState, useEffect, useCallback } from "react";
import { SubscriptionStatus } from "@/types";
import { Api } from "@/services/api";

/**
 * Hook para gerenciar operações e estado de assinatura Stripe.
 * Centraliza chamadas aos endpoints e expõe o status atual mastigado.
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  /** Verifica o status atual da assinatura */
  const refreshSubscription = useCallback(async () => {
    try {
      const data = await Api.subscription.getStatus();
      setSubscription(data);
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados inicialmente
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  /** Cria uma sessão de checkout no Stripe e retorna a URL */
  const createCheckout = async (priceType: "monthly" | "annual") => {
    return await Api.stripe.checkout(priceType);
  };

  /** Cria uma sessão do Stripe Customer Portal e retorna a URL */
  const openPortal = async () => {
    return await Api.stripe.openPortal();
  };

  /** Solicita o cancelamento da assinatura ao final do período */
  const cancelSubscription = async () => {
    const data = await Api.stripe.cancel();
    
    // Atualizar o estado local após o cancelamento
    await refreshSubscription();
    return data;
  };

  return {
    subscription,
    isLoading,
    refreshSubscription,
    createCheckout,
    openPortal,
    cancelSubscription,
  };
}
