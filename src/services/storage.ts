import type { Loja, Produto, HistoricoPedido } from '../types';
import { DEFAULT_LOJA } from '../types';

// ── Loja ──────────────────────────────────────────────────────────────────────

export async function getLoja(): Promise<Loja | null> {
  const response = await fetch('/api/loja');
  if (!response.ok) return DEFAULT_LOJA;
  
  const data = await response.json();
  if (!data) return null;

  return {
    ...DEFAULT_LOJA,
    nome: data.nome,
    telefone: data.telefone,
    endereco: data.endereco,
    logo_raw: data.logo_raw,
    logo_metodo: data.logo_metodo,
    mensagem_rodape: data.mensagem_rodape,
  };
}

export async function saveLoja(loja: Loja): Promise<void> {
  const response = await fetch('/api/loja', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loja)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Falha ao salvar loja');
  }
}

// ── Produtos ───────────────────────────────────────────────────────────────

export async function getProdutos(): Promise<Produto[]> {
  const response = await fetch('/api/produtos');
  if (!response.ok) return [];
  return response.json();
}

export async function addProduto(nome: string, preco: number): Promise<Produto> {
  const response = await fetch('/api/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, preco })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Falha ao adicionar produto');
  }

  return response.json();
}

export async function deleteProduto(id: string): Promise<void> {
  const response = await fetch(`/api/produtos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Falha ao deletar produto');
  }
}

// ── Histórico ─────────────────────────────────────────────────────────────

export async function getHistorico(): Promise<HistoricoPedido[]> {
  const response = await fetch('/api/pedidos');
  if (!response.ok) return [];
  return response.json();
}

export async function addToHistorico(pedido: Omit<HistoricoPedido, 'id' | 'created_at' | 'user_id'>): Promise<HistoricoPedido> {
  const response = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Falha ao salvar pedido no histórico');
  }

  return response.json();
}

export async function deleteHistorico(id: string): Promise<void> {
  const response = await fetch(`/api/pedidos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Falha ao deletar pedido do histórico');
  }
}
