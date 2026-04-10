import { useState, useEffect, useCallback } from "react";
import { SubscriptionStatus } from "@/types";

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
      const res = await fetch("/api/auth/subscription");

      if (!res.ok) {
        console.error(`Erro na API de assinatura: ${res.status}`);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
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
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceType }),
    });

    const { url, error } = await res.json();
    if (error) throw new Error(error);
    return { url };
  };

  /** Cria uma sessão do Stripe Customer Portal e retorna a URL */
  const openPortal = async () => {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
    });

    const { url, error } = await res.json();
    if (error) throw new Error(error);
    return { url };
  };

  /** Solicita o cancelamento da assinatura ao final do período */
  const cancelSubscription = async () => {
    const res = await fetch("/api/stripe/cancel", {
      method: "POST",
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
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
