import { request } from "./base";
import type { SubscriptionStatus } from "../../types";

export const subscriptionApi = {
  /** 
   * Obtém o status atual da assinatura no nosso backend.
   * Verifica banco de dados, trial e integração com Stripe.
   */
  getStatus: () => request<SubscriptionStatus>("/api/auth/subscription"),
};
