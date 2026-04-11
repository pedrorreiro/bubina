import { stripe, PRICES } from "@/lib/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/** Fim do período (Unix s): no Stripe API recente costuma vir no primeiro subscription item. */
function getStripeSubscriptionPeriodEndUnix(
  sub: Stripe.Subscription,
): number | null {
  const first = sub.items?.data?.[0];
  if (first && typeof first.current_period_end === "number") {
    return first.current_period_end;
  }
  const legacy = sub as Stripe.Subscription & { current_period_end?: number };
  return typeof legacy.current_period_end === "number"
    ? legacy.current_period_end
    : null;
}

function guessBillingDaysFromSubscription(sub: Stripe.Subscription): number {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  if (price && typeof price === "object" && price.recurring?.interval) {
    return price.recurring.interval === "year" ? 366 : 31;
  }
  const plan = item?.plan;
  if (plan && typeof plan === "object" && "interval" in plan) {
    const interval = (plan as { interval?: string }).interval;
    return interval === "year" ? 366 : 31;
  }
  return 31;
}

export interface Subscription {
  active: boolean;
  reason: "no_store" | "manual" | "trial" | "paid" | "expired";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  subscriptionStatus: string | null;
  isCanceling: boolean;
}

export interface AppFeatures {
  canShowLogo: boolean;
  unlimitedPrints: boolean;
  customFooter: boolean;
  prioritySupport: boolean;
}

export class SubscriptionService {
  /**
   * Converte o status da assinatura em flags de funcionalidades.
   */
  static getFeatures(status: Subscription): AppFeatures {
    const isPremium = status.active;
    return {
      canShowLogo: isPremium,
      unlimitedPrints: isPremium,
      customFooter: isPremium,
      prioritySupport: status.reason === "paid", // Apenas para quem paga (não trial)
    };
  }
  /**
   * ÚNICA fonte de verdade para buscar e calcular o status de uma assinatura.
   */
  static async getSubscription(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<Subscription> {
    const { data: loja, error: dbError } = await supabase
      .from("lojas")
      .select(
        "trial_ends_at, subscription_status, is_premium, is_canceling, current_period_end",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (dbError || !loja) {
      return {
        active: false,
        reason: dbError ? "expired" : "no_store",
        trialEndsAt: null,
        currentPeriodEnd: null,
        subscriptionStatus: null,
        isCanceling: false,
      };
    }

    return this.calculateAccess(loja);
  }

  /**
   * Lógica pura de cálculo de acesso baseada nos dados da loja.
   */
  private static calculateAccess(loja: {
    is_premium?: boolean;
    trial_ends_at?: string | null;
    is_canceling?: boolean;
    current_period_end?: string | null;
    subscription_status?: string | null;
  }): Subscription {
    // 1. Check for manual override (Lifetime/Manual access)
    if (loja.is_premium) {
      return {
        active: true,
        reason: "manual",
        trialEndsAt: null,
        currentPeriodEnd: null,
        subscriptionStatus: "active",
        isCanceling: false,
      };
    }

    const now = new Date();
    const trialEndsAt = loja.trial_ends_at
      ? new Date(loja.trial_ends_at)
      : null;
    const isCanceling = !!loja.is_canceling;

    // 2. Check for trial period
    if (trialEndsAt && trialEndsAt > now) {
      return {
        active: true,
        reason: "trial",
        trialEndsAt: loja.trial_ends_at || null,
        currentPeriodEnd: loja.current_period_end || null,
        subscriptionStatus: loja.subscription_status || null,
        isCanceling,
      };
    }

    // 3. Check for paid subscription
    const periodEnd = loja.current_period_end
      ? new Date(loja.current_period_end)
      : null;
    const isPaid =
      loja.subscription_status === "active" ||
      loja.subscription_status === "past_due";

    // Só está ativo se o status for pago E a data de expiração não passou (fail-safe)
    const isSubscriptionValid = isPaid && (periodEnd ? periodEnd > now : true);

    if (isSubscriptionValid) {
      return {
        active: true,
        reason: "paid",
        trialEndsAt: loja.trial_ends_at || null,
        currentPeriodEnd: loja.current_period_end || null,
        subscriptionStatus: loja.subscription_status || null,
        isCanceling,
      };
    }

    return {
      active: false,
      reason: "expired",
      trialEndsAt: loja.trial_ends_at || null,
      currentPeriodEnd: loja.current_period_end || null,
      subscriptionStatus: loja.subscription_status || null,
      isCanceling,
    };
  }

  /**
   * Cria uma sessão de checkout no Stripe.
   */
  static async createCheckoutSession(
    supabase: SupabaseClient,
    userId: string,
    email: string,
    priceType: "monthly" | "annual",
    baseUrl: string,
  ) {
    // 1. Buscar ou Criar Loja
    const { data: loja } = await supabase
      .from("lojas")
      .select("id, stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (!loja) throw new Error("Loja não encontrada");

    // 2. Garantir Stripe Customer
    let customerId = loja.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { loja_id: loja.id, user_id: userId },
      });
      customerId = customer.id;
      await supabase
        .from("lojas")
        .update({ stripe_customer_id: customerId })
        .eq("id", loja.id);
    }

    // 3. Criar Sessão
    const priceId = priceType === "monthly" ? PRICES.monthly : PRICES.annual;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pedido?checkout=success`,
      cancel_url: `${baseUrl}/paywall`,
      metadata: { loja_id: loja.id, user_id: userId },
    });

    return { url: session.url };
  }

  /**
   * Processa eventos do Webhook do Stripe.
   */
  static async processWebhookEvent(
    supabase: SupabaseClient,
    event: Stripe.Event,
  ) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const lojaId = session.metadata?.loja_id;

        const periodEnd = await this.fetchPeriodEndFromStripe(subscriptionId);

        if (lojaId) {
          const data = {
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            subscription_status: "active",
            current_period_end: periodEnd,
            is_canceling: false,
          };

          console.log("📦 [Service] Atualizando loja", lojaId);
          console.log("📦 [Service] Atualizando loja com os dados:", data);

          const { error: updateError } = await supabase
            .from("lojas")
            .update(data)
            .eq("id", lojaId);

          if (updateError) {
            console.error(
              "❌ [Service] Erro ao atualizar banco:",
              updateError.message,
            );
            console.error("❌ [Service] Detalhes do erro:", updateError);
          } else {
            console.log("✅ [Service] Banco atualizado com sucesso!");
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const periodUnix = getStripeSubscriptionPeriodEndUnix(subscription);
        const periodEnd = periodUnix
          ? new Date(periodUnix * 1000).toISOString()
          : null;

        const { error: updateError } = await supabase
          .from("lojas")
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: periodEnd,
            is_canceling: subscription.cancel_at_period_end,
          })
          .eq("stripe_customer_id", customerId);

        if (updateError) {
          console.error(
            "❌ [Service] Erro ao atualizar assinatura:",
            updateError.message,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error: updateError } = await supabase
          .from("lojas")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
            is_canceling: false,
          })
          .eq("stripe_customer_id", customerId);

        if (updateError) {
          console.error(
            "❌ [Service] Erro ao deletar assinatura:",
            updateError.message,
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const { error: updateError } = await supabase
          .from("lojas")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);

        if (updateError) {
          console.error(
            "❌ [Service] Erro ao marcar falha de pagamento:",
            updateError.message,
          );
        }
        break;
      }
    }
  }

  /**
   * Auxiliar para buscar a data de expiração no Stripe com fallback.
   */
  private static async fetchPeriodEndFromStripe(
    subscriptionId: string,
  ): Promise<string | null> {
    if (!subscriptionId) return null;
    try {
      const subscription = (await stripe.subscriptions.retrieve(
        subscriptionId,
      )) as Stripe.Subscription;
      const periodUnix = getStripeSubscriptionPeriodEndUnix(subscription);
      if (periodUnix !== null) {
        return new Date(periodUnix * 1000).toISOString();
      }
      if (subscription?.created) {
        const duration = guessBillingDaysFromSubscription(subscription);
        const date = new Date(subscription.created * 1000);
        date.setDate(date.getDate() + duration);
        return date.toISOString();
      }
    } catch (e) {
      console.error("⚠️ [Service] Erro ao buscar expiração no Stripe:", e);
    }
    return null;
  }
}
