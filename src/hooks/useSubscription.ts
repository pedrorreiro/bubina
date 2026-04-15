import { useCallback, useState } from "react";
import { Api } from "@/services/api";
import { useApp } from "@/context/AppContext";

/**
 * Hook para gerenciar operações e estado de assinatura Stripe.
 * Centraliza chamadas aos endpoints e expõe o status atual mastigado.
 */
export function useSubscription() {
  const {
    subscription,
    setSubscriptionState,
    isLoading: isAppLoading,
  } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /** Verifica o status atual da assinatura */
  const refreshSubscription = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await Api.subscription.getStatus();
      setSubscriptionState(data);
      return data;
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [setSubscriptionState]);

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

    // Atualizar estado global após o cancelamento
    await refreshSubscription();
    return data;
  };

  return {
    subscription,
    isLoading: isAppLoading || isRefreshing,
    refreshSubscription,
    createCheckout,
    openPortal,
    cancelSubscription,
  };
}
