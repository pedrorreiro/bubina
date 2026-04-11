import { lojaApi } from "./loja";
import { produtosApi } from "./produtos";
import { pedidosApi } from "./pedidos";
import { stripeApi } from "./stripe";
import { subscriptionApi } from "./subscription";

/**
 * Cliente de API Unificado.
 * Domínios: Api.loja, Api.produtos, Api.pedidos, Api.stripe, Api.subscription.
 */
export const Api = {
  loja: lojaApi,
  produtos: produtosApi,
  pedidos: pedidosApi,
  stripe: stripeApi,
  subscription: subscriptionApi,
};

// ── Exportações Individuais (Compatibilidade Legada) ─────────────────────────
export const getLoja = lojaApi.get;
export const saveLoja = lojaApi.save;

export const getProdutos = produtosApi.list;
export const addProduto = produtosApi.add;
export const deleteProduto = produtosApi.delete;

export const getHistorico = pedidosApi.list;
export const addToHistorico = pedidosApi.add;
export const deleteHistorico = pedidosApi.delete;

// Assinatura e Stripe
export const getSubscriptionStatus = subscriptionApi.getStatus;
export const createStripeCheckout = stripeApi.checkout;
export const openStripePortal = stripeApi.openPortal;
export const cancelStripeSubscription = stripeApi.cancel;

export default Api;
