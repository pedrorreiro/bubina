import { supabase } from "@/lib/supabase";

export const StorageService = {
  /**
   * Faz o upload de uma logo para o bucket 'logos' do Supabase Storage.
   */
  async uploadLogo(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (error) {
      console.error('Erro ao fazer upload da logo:', error);
      throw error;
    }

    // Retorna o caminho público ou o path para ser recuperado depois
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  /**
   * Remove uma logo do storage dado o caminho ou URL.
   */
  async deleteLogo(url: string): Promise<void> {
    try {
      // Extrair o path do URL se necessário
      const path = url.split('/').pop();
      if (!path) return;

      const { error } = await supabase.storage
        .from('logos')
        .remove([`logos/${path}`]);

      if (error) {
        console.error('Erro ao remover logo do storage:', error);
      }
    } catch (e) {
      console.error('Erro ao processar remoção de logo:', e);
    }
  }
};
