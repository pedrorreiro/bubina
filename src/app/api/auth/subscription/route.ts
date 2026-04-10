import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { getSubscription } from './subscription-logic';

export async function GET() {
  try {
    console.log('🏁 [API/Subscription] Iniciando verificação...');
    const supabase = await createClient();
    
    console.log('👤 [API/Subscription] Buscando usuário...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn('⚠️ [API/Subscription] Usuário não autenticado');
      return NextResponse.json({ active: false, reason: 'unauthenticated' }, { status: 401 });
    }

    console.log(`🔍 [API/Subscription] Buscando assinatura para user: ${user.id}`);
    const status = await getSubscription(supabase, user.id);

    console.log('✅ [API/Subscription] Status calculado com sucesso');
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('💥 [API/Subscription] ERRO FATAL:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
