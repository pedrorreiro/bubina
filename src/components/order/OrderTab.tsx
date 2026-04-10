import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  ShoppingCart,
  User,
  Tag,
  ArrowUpDown,
  Plus,
  Printer as PrinterIcon,
  GripVertical,
  X,
  FileText,
  Eye,
  Lock,
} from "lucide-react";

import type { ItemPedido, Desconto, Pedido } from "@/types";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { gerarPreview } from "@/services/cupom";
import { LivePreview } from "./LivePreview";
import { maskCPF } from "@/lib/utils";

interface OrderTabProps {}

// ── Sortable Item Component ──────────────────────────────────────────────────

interface SortableItemProps {
  id: string;
  item: ItemPedido;
  sub: number;
  idx: number;
  onUpdateQtd: (idx: number, val: string) => void;
  onUpdatePreco: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
}

function SortableItem({
  id,
  item,
  sub,
  idx,
  onUpdateQtd,
  onUpdatePreco,
  onRemove,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 rounded-2xl transition-all duration-300 group
        ${
          isDragging
            ? "z-[1001] bg-surface-raised border border-primary/40 shadow-2xl opacity-90 scale-[1.03] ring-1 ring-primary/20"
            : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]"
        }
      `}
    >
      <div
        className="cursor-grab active:cursor-grabbing p-1.5 text-text-dim group-hover:text-primary transition-colors bg-white/5 rounded-lg"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <div className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
          {item.nome}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-bold text-white/40 tabular-nums">
            R$ {sub.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5 items-center">
          <span className="text-[8px] font-black text-text-dim uppercase tracking-tighter">
            Qtd
          </span>
          <input
            className="w-12 h-9 bg-black/40 border border-white/5 rounded-xl text-center text-xs font-bold text-white focus:border-primary/50 outline-none transition-all"
            type="number"
            value={item.qtd ?? ""}
            onChange={(e) => onUpdateQtd(idx, e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-0.5 items-center">
          <span className="text-[8px] font-black text-text-dim uppercase tracking-tighter">
            Unit.
          </span>
          <input
            className="w-16 h-9 bg-black/40 border border-white/5 rounded-xl text-center text-xs font-bold text-white focus:border-primary/50 outline-none transition-all"
            type="number"
            value={item.preco_uni}
            onChange={(e) => onUpdatePreco(idx, e.target.value)}
          />
        </div>

        <button
          className="p-2 text-text-dim hover:text-red hover:bg-red/10 rounded-lg transition-all"
          onClick={() => onRemove(idx)}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function OrderTab({}: OrderTabProps) {
  const {
    produtos,
    loja,
    setLoja,
    printerStatus,
    printCupom,
    pedidoReaberto,
    setPedidoReaberto,
  } = useApp();
  const { subscription } = useSubscription();
  const isPremium = subscription?.active;

  const [cpf, setCpf] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [descontos, setDescontos] = useState<Desconto[]>([]);
  const [printing, setPrinting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states
  const [avNome, setAvNome] = useState("");
  const [avQtd, setAvQtd] = useState("");
  const [avPreco, setAvPreco] = useState("");

  const [dNome, setDNome] = useState("");
  const [dTipo, setDTipo] = useState<"valor" | "percentual">("valor");
  const [dValor, setDValor] = useState("");

  const [mobileView, setMobileView] = useState<"venda" | "cardapio">("venda");

  const genId = () => Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (pedidoReaberto) {
      setItens(pedidoReaberto.itens);
      setDescontos(pedidoReaberto.descontos);
      setCpf(pedidoReaberto.cpf || "");
      setFinished(false);
      setPedidoReaberto(null);
      toast.success("Pedido reaberto para edição");
    }
  }, [pedidoReaberto, setPedidoReaberto]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const calcSubtotal = (): number =>
    itens.reduce(
      (s, i) => s + (i.qtd === null ? i.preco_uni : (i.qtd ?? 1) * i.preco_uni),
      0,
    );

  const calcTotal = (): number => {
    let t = calcSubtotal();
    for (const d of descontos) {
      const abat = d.tipo === "valor" ? d.valor : (t * d.valor) / 100;
      t = Math.max(0, t - abat);
    }
    return t;
  };

  const buildPedido = (): Pedido => ({
    cpf: cpf.replace(/\D/g, "") || null,
    itens,
    descontos,
    total: calcTotal(),
  });

  const preview = gerarPreview(buildPedido(), loja);

  const addFromCatalog = (p: Produto) => {
    setItens((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: p.nome, qtd: 1, preco_uni: p.preco },
    ]);
    toast.info(`${p.nome} adicionado!`);
  };

  const addManual = () => {
    if (!avNome.trim() || !avPreco) {
      toast.error("Preencha nome e preço");
      return;
    }
    const qtd = avQtd === "" ? null : parseInt(avQtd);
    setItens((prev) => [
      ...prev,
      { id: genId(), nome: avNome, qtd, preco_uni: parseFloat(avPreco) },
    ]);
    setAvNome("");
    setAvQtd("");
    setAvPreco("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItens((items) => {
        const oldIndex = items.findIndex((it) => it.id === active.id);
        const newIndex = items.findIndex((it) => it.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddDesconto = () => {
    const val = parseFloat(dValor);
    if (!dValor || isNaN(val) || val <= 0) {
      toast.error("Digite um valor válido");
      return;
    }
    setDescontos((prev) => [...prev, { nome: dNome, tipo: dTipo, valor: val }]);
    setDNome("");
    setDValor("");
  };

  const handleImprimir = async () => {
    try {
      if (printerStatus !== "connected") {
        toast.error("Conecte uma impressora");
        return;
      }
      if (itens.length === 0) {
        toast.error("Adicione itens primeiro");
        return;
      }
      
      setPrinting(true);
      const p: Pedido = { cpf: cpf?.trim() || null, itens, descontos, total: calcTotal() };
      await printCupom(p);
      toast.success("Cupom impresso! 🎉");
      handleNovoPedido();
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : e}`);
    } finally {
      setPrinting(false);
    }
  };

  const handleNovoPedido = () => {
    setItens([]);
    setDescontos([]);
    setCpf("");
    setFinished(false);
    toast.info("Novo pedido iniciado");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addManual();
  };

  const subtotal = calcSubtotal();
  const total = calcTotal();

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] overflow-hidden lg:pt-4">
      {/* Mobile View Switcher */}
      <div className="flex lg:hidden p-1 bg-white/5 rounded-2xl border border-white/10 mb-6 gap-1 shadow-2xl">
        <button
          onClick={() => setMobileView("venda")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 font-bold text-xs uppercase tracking-widest ${
            mobileView === "venda"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-text-dim hover:bg-white/5"
          }`}
        >
          <ShoppingCart size={14} className={mobileView === "venda" ? "animate-bounce-short" : ""} />
          Comanda
          {itens.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {itens.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setMobileView("cardapio")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 font-bold text-xs uppercase tracking-widest ${
            mobileView === "cardapio"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-text-dim hover:bg-white/5"
          }`}
        >
          <Plus size={14} className={mobileView === "cardapio" ? "rotate-90 transition-transform duration-500" : ""} />
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start pb-24 lg:pb-0 flex-1 overflow-hidden">
        {/* ── LEFT COLUMN: THE ACTIVE TICKET (BILL) ──────────────────────── */}
        <div className={`flex flex-col h-full glass-panel overflow-hidden border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.6)] ${
          mobileView !== "venda" ? "hidden lg:flex" : "flex"
        }`}>
        {/* Ticket Header: Identification */}
        <div className="p-8 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <ShoppingCart size={20} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Venda Atual
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                title="Ver Preview do Cupom"
              >
                <Eye size={18} />
              </button>
              {itens.length > 1 && (
                <button
                  onClick={() => setItens((prev) => [...prev].reverse())}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-text-muted hover:text-white transition-all hover:bg-white/10"
                  title="Inverter Ordem"
                >
                  <ArrowUpDown size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="relative group">
            <User
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors"
            />
            <input
              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="CPF do Cliente (Opcional)"
            />
          </div>
        </div>

        {/* Ticket Body: Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar min-h-0 bg-black/10">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <ShoppingCart size={40} className="mb-4" />
              <p className="text-sm font-semibold uppercase tracking-widest text-text-dim">
                Ticket Vazio
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={itens.map((it) => it.id!)}
                strategy={verticalListSortingStrategy}
              >
                {itens.map((item, idx) => {
                  const sub =
                    item.qtd === null
                      ? item.preco_uni
                      : (item.qtd ?? 1) * item.preco_uni;
                  return (
                    <SortableItem
                      key={item.id}
                      id={item.id!}
                      item={item}
                      sub={sub}
                      idx={idx}
                      onUpdateQtd={(i, v) =>
                        setItens((p) =>
                          p.map((it, x) =>
                            x === i
                              ? { ...it, qtd: v === "" ? null : parseInt(v) }
                              : it,
                          ),
                        )
                      }
                      onUpdatePreco={(i, v) =>
                        setItens((p) =>
                          p.map((it, x) =>
                            x === i
                              ? { ...it, preco_uni: parseFloat(v) || 0 }
                              : it,
                          ),
                        )
                      }
                      onRemove={(i) =>
                        setItens((p) => p.filter((_, x) => x !== i))
                      }
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Ticket Footer: Totals & Actions */}
        <div className="p-8 border-t border-white/[0.08] bg-white/[0.01] relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="space-y-6 mb-8">
            {/* Summary Lines */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                <span>Resumo da Venda</span>
                <span className="text-white">
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {descontos.length > 0 && (
                <div className="space-y-2">
                  {descontos.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] font-bold text-red uppercase tracking-tight"
                    >
                      <div className="flex items-center gap-2">
                        <Tag size={10} />
                        <span>{d.nome || "Desconto"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>
                          -
                          {d.tipo === "valor" ? `R$ ${d.valor}` : `${d.valor}%`}
                        </span>
                        <button
                          onClick={() =>
                            setDescontos((p) => p.filter((_, x) => x !== i))
                          }
                          className="hover:opacity-60"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Totalizer */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.4em]">
                Total Bruto
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">R$</span>
                <span className="text-3xl font-bold text-white tracking-tighter tabular-nums leading-none">
                  {total.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>

          {finished ? (
            <button
              className="w-full bg-white text-bg h-16 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-primary hover:text-white transition-all group rounded-2xl"
              onClick={handleNovoPedido}
            >
              <Plus
                size={20}
                className="transition-transform group-hover:rotate-90"
              />
              <span>Nova Venda</span>
            </button>
          ) : (
            <button
              className="w-full btn-primary h-[72px] flex items-center justify-center gap-4 text-[13px] font-bold shadow-2xl disabled:opacity-30 group active:scale-[0.98] transition-all rounded-2xl"
              disabled={
                printing || printerStatus !== "connected" || itens.length === 0
              }
              onClick={handleImprimir}
            >
              {printing ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-4">
                  <PrinterIcon
                    size={24}
                    className="transition-transform group-hover:-translate-y-1"
                  />
                  <span className="uppercase tracking-widest leading-none">
                    Finalizar Pedido
                  </span>
                </div>
              )}
            </button>
          )}

          {printerStatus !== "connected" && (
            <div className="flex items-center justify-center gap-3 pt-6 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-red">
                Impressora Oflline
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: THE COMMAND DECK (CATALOG & ENTRY) ───────────────── */}
      <div className={`space-y-8 flex flex-col h-full overflow-hidden ${
        mobileView !== "cardapio" ? "hidden lg:flex" : "flex"
      }`}>
        {/* Manual Entry Console - Unified Top Bar */}
        <div className="glass-panel p-2 flex flex-col sm:flex-row items-center gap-2 border-white/[0.05] shadow-xl">
          <div className="flex-1 flex items-center gap-3 pl-4 w-full">
            <Plus size={18} className="text-primary/60" />
            <input
              className="w-full bg-transparent border-none py-4 text-sm font-semibold text-white outline-none placeholder:text-text-dim/40"
              placeholder="Entrada manual de produto ou serviço..."
              value={avNome}
              onChange={(e) => setAvNome(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={24}
            />
          </div>
          <div className="hidden sm:block w-[1px] h-10 bg-white/10" />
          <div className="relative flex items-center w-full sm:w-auto overflow-hidden rounded-xl bg-black/20 border border-white/5 sm:bg-transparent sm:border-none sm:rounded-none">
            <input
              className="w-full sm:w-16 bg-transparent border-none py-4 text-sm font-bold text-white text-center outline-none placeholder:text-text-dim/40"
              type="number"
              placeholder="Qtd"
              value={avQtd}
              onChange={(e) => setAvQtd(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="hidden sm:block w-[1px] h-10 bg-white/10" />
          <div className="relative flex items-center w-full sm:w-auto overflow-hidden rounded-xl bg-black/20 border border-white/5 sm:bg-transparent sm:border-none sm:rounded-none">
            <span className="absolute left-4 text-[10px] font-bold text-primary/60">
              R$
            </span>
            <input
              className="w-full sm:w-28 bg-transparent border-none py-4 pl-10 pr-4 text-sm font-bold text-white text-right outline-none placeholder:text-text-dim/40"
              type="number"
              placeholder="0,00"
              value={avPreco}
              onChange={(e) => setAvPreco(e.target.value)}
              onKeyDown={handleKeyDown}
              step="0.01"
            />
          </div>
          <button
            className="w-full sm:w-14 h-14 bg-primary text-white flex items-center justify-center rounded-xl hover:bg-primary-hover shadow-lg active:scale-95 transition-all"
            onClick={addManual}
          >
            <Plus size={24} />
          </button>
        </div>

        {/* 2. Catalog Grid & Quick Discounts */}
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-hidden">
          {/* Quick Actions Panel */}
          <div className="p-6 glass-panel border-white/[0.04] bg-white/[0.01]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                <Tag size={16} className="text-primary" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Descontos
                </span>
              </div>
              <div className="flex flex-1 gap-2">
                <input
                  className="flex-1 min-w-0 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white/20"
                  placeholder="Referência (Ex: Parceria)"
                  value={dNome}
                  onChange={(e) => setDNome(e.target.value)}
                />
                <div className="relative group w-32">
                  <input
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-3 pr-8 py-3 text-xs font-bold text-white outline-none text-right focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    placeholder="0,00"
                    type="number"
                    value={dValor}
                    onChange={(e) => setDValor(e.target.value)}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[10px] font-black text-primary hover:text-white transition-colors uppercase"
                    onClick={() =>
                      setDTipo(dTipo === "valor" ? "percentual" : "valor")
                    }
                  >
                    {dTipo === "valor" ? "R$" : "%"}
                  </button>
                </div>
                <button
                  className="px-5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-white hover:bg-primary hover:border-primary transition-all uppercase tracking-widest disabled:opacity-20 flex items-center gap-2"
                  onClick={handleAddDesconto}
                  disabled={!dValor}
                >
                  <Plus size={14} /> Aplicar
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Selection Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 -mr-3 relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-[0.25em]">
                Sua Vitrine
              </span>
              <div className="flex-1 h-[1px] bg-white/[0.08]" />
              {isPremium && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">
                    Estoque On-line
                  </span>
                </div>
              )}
            </div>

            {!isPremium ? (
              <div className="flex flex-col items-center justify-center py-20 px-10 bg-primary/5 border border-dashed border-primary/20 rounded-3xl text-center gap-4 relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-lg shadow-primary/5">
                  <Lock size={28} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Catálogo de Produtos
                  </h3>
                  <p className="text-sm text-text-dim mt-2 max-w-[280px]">
                    Assine o plano <b>Premium</b> para cadastrar seus itens e
                    vender com um clique.
                  </p>
                </div>
                <a
                  href="/paywall"
                  className="btn-primary px-8 h-12 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest mt-2 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  Ver Planos
                </a>
              </div>
            ) : produtos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl opacity-20 text-center">
                <Tag size={32} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  Nenhum item cadastrado
                </p>
                <p className="text-[10px] text-text-dim mt-2 tracking-tight">
                  Vá em "Catálogo" para adicionar produtos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                {produtos.map((p) => (
                  <button
                    key={p.id}
                    className="flex flex-col p-6 bg-white/[0.03] border border-white/[0.05] rounded-[24px] cursor-pointer hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] transition-all duration-300 active:scale-[0.96] text-left relative group overflow-hidden"
                    onClick={() => addFromCatalog(p)}
                  >
                    {/* Interaction Glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors pr-2">
                      {p.nome}
                    </div>
                    <div className="text-xs font-bold text-primary/80 flex items-baseline gap-0.5 mt-auto">
                      <span className="text-[10px] opacity-70">R$</span>
                      <span className="text-lg tabular-nums">
                        {p.preco.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                      <div className="p-1.5 bg-primary rounded-lg shadow-lg">
                        <Plus size={14} className="text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LivePreview
        text={preview}
        colunas={loja.largura_colunas}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  </div>
  );
}
