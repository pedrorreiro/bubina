import { cache } from "react";
import { AuthService } from "./auth";
import { StoreService } from "./store";
import { SubscriptionService } from "./subscription";
import { createClient } from "@/lib/supabase-server";

/**
 * Função centralizada e MEMOIZADA para obter o contexto completo do usuário.
 * Pode ser chamada em múltiplos componentes/layouts na mesma renderização
 * sem custo extra, graças ao React 'cache'.
 */
export const getServerSession = cache(async () => {
  const user = await AuthService.getUser();

  if (!user) {
    return {
      authenticated: false,
      user: null,
      loja: null,
      subscription: null,
      isOnboarded: false,
    };
  }

  const loja = await StoreService.getStoreByUserId(user.id);

  // Obter status da assinatura (já centralizado no Service)
  const supabase = await createClient();
  const subscription = await SubscriptionService.getSubscription(
    supabase,
    user.id,
  );

  return {
    authenticated: true,
    user,
    loja,
    subscription,
  };
});
