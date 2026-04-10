import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Necessário para o webhook receber o body raw
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`⚠️ Webhook signature verification failed: ${msg}`);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      const lojaId = session.metadata?.loja_id;

      console.log(`✅ [Webhook] Checkout concluído. Loja: ${lojaId}, Sub: ${subscriptionId}`);

      if (lojaId) {
        // Buscar detalhes da assinatura para pegar a data de expiração (current_period_end)
        let periodEnd = null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }

        // Método Recomendado: Usar o ID da loja que enviamos no checkout
        const { error } = await supabase
          .from('lojas')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId, // Garante que esteja sincronizado
            subscription_status: 'active',
            current_period_end: periodEnd,
            is_canceling: false
          })
          .eq('id', lojaId);

        if (error) {
          console.error(`❌ [Webhook] Erro ao atualizar loja por ID (${lojaId}):`, error.message);
        }
      } else if (customerId) {
        // Fallback: Buscar pelo customer_id caso o metadata falhe
        console.warn('⚠️ [Webhook] Metadata loja_id ausente. Usando fallback por customer_id.');
        const { error } = await supabase
          .from('lojas')
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('❌ [Webhook] Erro no fallback por customer_id:', error.message);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const isCanceling = subscription.cancel_at_period_end;

      const { error } = await supabase
        .from('lojas')
        .update({
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
          current_period_end: periodEnd,
          is_canceling: isCanceling
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('❌ [Webhook] Erro ao atualizar status da assinatura:', error.message);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { error } = await supabase
        .from('lojas')
        .update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          current_period_end: null,
          is_canceling: false
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('❌ [Webhook] Erro ao cancelar assinatura:', error.message);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { error } = await supabase
        .from('lojas')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Erro ao marcar pagamento falho:', error.message);
      }
      break;
    }

    default:
      // Evento não tratado
      break;
  }

  return NextResponse.json({ received: true });
}
