import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useHistory } from "@/hooks/useHistory";
import { 
  History, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  Package, 
  User,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoryTabProps {
  onSetActiveTab: (tab: "pedido" | "produtos" | "loja" | "ia" | "historico") => void;
}

export function HistoryTab({ onSetActiveTab }: HistoryTabProps) {
  const { historico, reabrirPedido } = useApp();
  const { deleteHistorico } = useHistory();

  const handleReabrir = (pedido: any) => {
    reabrirPedido(pedido);
    onSetActiveTab("pedido");
  };

  const handleExcluir = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remover venda do histórico?")) {
      await deleteHistorico(id);
      setHistorico(prev => prev.filter(p => p.id !== id));
      toast.info("Venda removida do histórico");
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Vendas Realizadas</h2>
            <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest">Histórico de Movimentação</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl">
          <span className="text-xl font-bold text-white tabular-nums leading-none">{historico.length}</span>
          <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Registros Efetivados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center glass-panel border-dashed border-white/10">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-8">
               <History size={32} className="text-text-dim opacity-10" />
            </div>
            <h3 className="text-white font-bold mb-2">Histórico Vazio</h3>
            <p className="text-sm text-text-dim max-w-[320px]">
              Suas vendas finalizadas aparecerão aqui automaticamente após a emissão do cupom.
            </p>
          </div>
        ) : (
          historico.map((venda) => (
            <div
              key={venda.id}
              onClick={() => handleReabrir(venda)}
              className="group glass-panel border-white/[0.04] p-8 hover:bg-white/[0.04] hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99] overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Date & ID */}
                <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-1 lg:min-w-[160px] lg:border-r lg:border-white/5">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar size={14} />
                    <span className="text-sm font-bold tracking-tight">
                      {format(new Date(venda.data), "dd MMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-text-dim">
                    <Clock size={12} strokeWidth={2.5} />
                    <span className="text-[11px] font-semibold tabular-nums">
                      {format(new Date(venda.data), "HH:mm")}
                    </span>
                  </div>
                </div>

                {/* Main Content Details */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Itens</p>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Package size={14} className="opacity-40" />
                      </div>
                      <span className="text-base font-bold">{venda.itens.length}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Cliente</p>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <User size={14} className="opacity-40" />
                      </div>
                      <span className="text-sm font-bold truncate max-w-[140px]">
                        {venda.cpf ? `CPF: ${venda.cpf}` : "Consumidor Final"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Valor Movimentado</p>
                    <div className="flex items-baseline gap-1.5">
                       <span className="text-sm font-bold text-primary">R$</span>
                       <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
                         {venda.total.toFixed(2).replace(".", ",")}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center gap-3 lg:pl-8 lg:border-l lg:border-white/5">
                  <button
                    onClick={(e) => handleExcluir(venda.id, e)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red/5 border border-red/10 text-red hover:bg-red hover:text-white transition-all shadow-lg shadow-red/5 group-hover:shadow-red/20"
                    title="Excluir do histórico"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-text-muted group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-lg group-hover:shadow-primary/30">
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
