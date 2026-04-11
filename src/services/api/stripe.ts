import { request } from "./base";
import type { SubscriptionStatus } from "../../types";

export const stripeApi = {
  /** Cria uma sessão de checkout no Stripe */
  checkout: (priceType: "monthly" | "annual") =>
    request<{ url: string }>("/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ priceType }),
    }),

  /** Cria uma sessão do Stripe Customer Portal */
  openPortal: () => request<{ url: string }>("/api/stripe/portal", { method: "POST" }),

  /** Solicita o cancelamento da assinatura */
  cancel: () => request<{ message?: string; error?: string }>("/api/stripe/cancel", { method: "POST" }),
};
