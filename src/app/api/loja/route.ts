import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { getSubscription } from '../auth/subscription/subscription-logic';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const loja = await req.json();

  // Buscar registro atual para comparar a logo e preservar o trial
  const { data: currentLoja } = await supabase
    .from('lojas')
    .select('logo_raw, trial_ends_at')
    .eq('user_id', user.id)
    .maybeSingle();

  // Verificar se está tentando mudar a logo
  const isChangingLogo = loja.logo_raw !== currentLoja?.logo_raw;

  if (isChangingLogo) {
    const subscription = await getSubscription(supabase, user.id);
    if (!subscription.active) {
      return NextResponse.json({ 
        error: 'Assinatura necessária para alterar o logotipo do cupom.',
        code: 'SUBSCRIPTION_REQUIRED' 
      }, { status: 402 });
    }
  }

  // Preservar trial existente ou criar um novo se for a primeira vez
  const trialEndsAt = currentLoja?.trial_ends_at || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('lojas')
    .upsert({
      user_id: user.id,
      nome: loja.nome,
      telefone: loja.telefone,
      endereco: loja.endereco,
      logo_raw: loja.logo_raw,
      logo_metodo: loja.logo_metodo,
      trial_ends_at: trialEndsAt,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
