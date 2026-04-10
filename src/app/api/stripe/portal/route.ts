import { createClient } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Buscar stripe_customer_id da loja
  const { data: loja, error: dbError } = await supabase
    .from('lojas')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (dbError || !loja?.stripe_customer_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 });
  }

  // Determinar URL base
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: loja.stripe_customer_id,
    return_url: `${baseUrl}/ajustes`,
  });

  return NextResponse.json({ url: session.url });
}
