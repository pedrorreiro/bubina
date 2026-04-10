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

      if (subscriptionId) {
        // Buscar loja pelo customer_id
        const { error } = await supabase
          .from('lojas')
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Erro ao atualizar loja após checkout:', error.message);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { error } = await supabase
        .from('lojas')
        .update({
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Erro ao atualizar status da assinatura:', error.message);
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
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Erro ao cancelar assinatura:', error.message);
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
