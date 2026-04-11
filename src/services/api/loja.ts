import { request } from "./base";
import { DEFAULT_LOJA, type Loja } from "../../types";

export const lojaApi = {
  get: async (): Promise<Loja> => {
    const data = await request<any>("/api/loja");
    if (!data) return DEFAULT_LOJA;

    return {
      ...DEFAULT_LOJA,
      nome: data.nome,
      telefone: data.telefone,
      endereco: data.endereco,
      logo_url: data.logo_url,
      logo_metodo: data.logo_metodo,
      mensagem_rodape: data.mensagem_rodape,
      largura_mm: data.largura_mm || DEFAULT_LOJA.largura_mm,
      largura_colunas: data.largura_colunas || DEFAULT_LOJA.largura_colunas,
    };
  },

  save: (loja: Loja) =>
    request("/api/loja", {
      method: "POST",
      body: JSON.stringify(loja),
    }),
};
