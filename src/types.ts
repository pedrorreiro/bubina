// ── Types ─────────────────────────────────────────────────────────────────────

export interface Produto {
  id: string;
  nome: string;
  preco: number;
}

export interface ItemPedido {
  nome: string;
  qtd: number | null;
  preco_uni: number;
  data?: string; // Formato YYYY-MM-DD
  id?: string; // ID único local para ordenação (DND) e Chaves React
}

export interface Desconto {
  nome: string;
  tipo: "valor" | "percentual";
  valor: number;
}

export interface Pedido {
  cpf: string | null;
  itens: ItemPedido[];
  descontos: Desconto[];
  total: number;
}

export interface HistoricoPedido extends Pedido {
  id: string;
  data: string; // ISO String
  total: number;
}

export interface Loja {
  nome: string;
  telefone: string;
  endereco: string;
  chave_pix: string;
  cidade: string;
  mensagem_rodape?: string;
  largura_mm: number;
  largura_colunas: number;
  logo?: string; // Processed bit data (cached)
  logo_raw?: string; // Original grayscale data
  logo_metodo?: "threshold" | "dither";
}

export interface SubscriptionStatus {
  active: boolean;
  reason: "trial" | "paid" | "expired" | "no_store" | "manual";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  subscriptionStatus: string | null;
  isCanceling: boolean;
}

export const DEFAULT_LOJA: Loja = {
  nome: "ESTABELECIMENTO",
  telefone: "",
  endereco: "",
  chave_pix: "",
  cidade: "",
  mensagem_rodape: "Obrigado pela preferencia!",
  largura_mm: 48,
  largura_colunas: 32,
};
