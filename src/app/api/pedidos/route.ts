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
    .from('pedidos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Verificar limites para usuários sem assinatura ativa
  const subscription = await getSubscription(supabase, user.id);
  
  if (!subscription.active) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (countError) {
      console.error('Erro ao contar pedidos do dia:', countError);
    } else if (count !== null && count >= 15) {
      return NextResponse.json({ 
        error: 'Limite diário de 15 impressões atingido para o plano gratuito.',
        code: 'LIMIT_REACHED'
      }, { status: 403 });
    }
  }

  const pedido = await req.json();

  const { data, error } = await supabase
    .from('pedidos')
    .insert({
      user_id: user.id,
      cpf: pedido.cpf,
      itens: pedido.itens,
      descontos: pedido.descontos,
      total: pedido.total
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
