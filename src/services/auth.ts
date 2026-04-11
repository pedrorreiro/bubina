import { createClient } from "@/lib/supabase-server";
import { User } from "@supabase/supabase-js";

export class AuthService {
  /**
   * Obtém o usuário atual autenticado no servidor.
   * Respeita o RLS e cookies de sessão.
   */
  static async getUser(): Promise<User | null> {
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return null;
      return user;
    } catch (e) {
      console.error("❌ [AuthService] Erro ao obter usuário:", e);
      return null;
    }
  }

  /**
   * Verifica se há uma sessão ativa.
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }
}
