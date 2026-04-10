import { stripe, PRICES } from "@/lib/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export interface SubscriptionStatus {
  active: boolean;
  reason: "no_store" | "manual" | "trial" | "paid" | "expired";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  subscriptionStatus: string | null;
  isCanceling: boolean;
}

export class SubscriptionService {
  /**
   * ÚNICA fonte de verdade para buscar e calcular o status de uma assinatura.
   */
  static async getSubscriptionStatus(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<SubscriptionStatus> {
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
  private static calculateAccess(loja: any): SubscriptionStatus {
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
        trialEndsAt: loja.trial_ends_at,
        currentPeriodEnd: loja.current_period_end,
        subscriptionStatus: loja.subscription_status,
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
        trialEndsAt: loja.trial_ends_at,
        currentPeriodEnd: loja.current_period_end,
        subscriptionStatus: loja.subscription_status,
        isCanceling,
      };
    }

    return {
      active: false,
      reason: "expired",
      trialEndsAt: loja.trial_ends_at,
      currentPeriodEnd: loja.current_period_end,
      subscriptionStatus: loja.subscription_status,
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

          await supabase.from("lojas").update(data).eq("id", lojaId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        await supabase
          .from("lojas")
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: periodEnd,
            is_canceling: subscription.cancel_at_period_end,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        await supabase
          .from("lojas")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
            is_canceling: false,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        await supabase
          .from("lojas")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);
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
      )) as any;
      if (subscription && typeof subscription.current_period_end === "number") {
        return new Date(subscription.current_period_end * 1000).toISOString();
      }
      // Fallback para billing flexível
      if (subscription && subscription.created) {
        const duration = subscription.plan?.interval === "year" ? 366 : 31;
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
