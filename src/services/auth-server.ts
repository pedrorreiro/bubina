import { headers, cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Utilitário centralizado e MEMOIZADO para chamadas de API de Autenticação,
 * Status de Loja e Assinatura. O uso do React 'cache' garante que múltiplas
 * chamadas em layouts aninhados resultem em apenas UMA requisição real por renderização.
 */
export const useServerAuth = cache(async () => {
  const headersList = await headers();
  const cookieStore = await cookies();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const cookieHeader = cookieStore.toString();

  return {
    /**
     * Retorna os dados do usuário atual, status de onboarding e assinatura.
     * Uma única chamada que resolve auth + loja + subscription.
     */
    async getMe() {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { cookie: cookieHeader },
        cache: 'no-store'
      });
      
      if (!res.ok) return { authenticated: false, user: null, hasLoja: false, subscription: null };
      return res.json();
    }
  };
});
