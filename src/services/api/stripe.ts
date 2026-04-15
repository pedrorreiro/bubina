import { request } from "./base";

export interface StripePriceInfo {
  id: string;
  unitAmount: number;
  currency: string;
  interval: "month" | "year" | null;
}

export const stripeApi = {
  /** Cria uma sessão de checkout no Stripe */
  checkout: (priceType: "monthly" | "annual") =>
    request<{ url: string }>("/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ priceType }),
    }),

  /** Cria uma sessão do Stripe Customer Portal */
  openPortal: () => request<{ url: string }>("/api/stripe/portal", { method: "POST" }),

  /** Busca os preços configurados no Stripe */
  getPrices: () =>
    request<{ monthly: StripePriceInfo | null; annual: StripePriceInfo | null }>(
      "/api/stripe/prices",
    ),

  /** Solicita o cancelamento da assinatura */
  cancel: () => request<{ message?: string; error?: string }>("/api/stripe/cancel", { method: "POST" }),
};
