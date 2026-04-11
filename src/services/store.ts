import { createClient } from "@/lib/supabase-server";

export class StoreService {
  /**
   * Obtém a loja vinculada a um ID de usuário.
   */
  static async getStoreByUserId(userId: string) {
    const supabase = await createClient();
    const { data: loja, error } = await supabase
      .from("lojas")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("❌ [StoreService] Erro ao buscar loja:", error.message);
      return null;
    }

    return loja;
  }
}
