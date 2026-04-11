import type { Desconto, HistoricoPedido, ItemPedido } from "@/types";

function calcTotalFromItems(itens: ItemPedido[], descontos: Desconto[]): number {
  const subtotal = itens.reduce(
    (s, i) => s + (i.qtd === null ? i.preco_uni : (i.qtd ?? 1) * i.preco_uni),
    0,
  );
  let total = subtotal;
  for (const d of descontos) {
    const abat = d.tipo === "valor" ? d.valor : (total * d.valor) / 100;
    total = Math.max(0, total - abat);
  }
  return total;
}

/** Coluna no banco: `data` (ISO). */
export function normalizeHistoricoPedido(row: unknown): HistoricoPedido {
  const r = row as Record<string, unknown>;
  const data =
    typeof r.data === "string" ? r.data : new Date().toISOString();

  const itens = Array.isArray(r.itens) ? (r.itens as ItemPedido[]) : [];
  const descontos = Array.isArray(r.descontos)
    ? (r.descontos as Desconto[])
    : [];

  let total = typeof r.total === "number" ? r.total : Number(r.total) || 0;

  if (total === 0 && itens.length > 0) {
    total = calcTotalFromItems(itens, descontos);
  }

  return {
    id: String(r.id ?? ""),
    cpf: (r.cpf as string | null) ?? null,
    itens,
    descontos,
    total,
    data,
  };
}
