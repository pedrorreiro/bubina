import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { useCatalog } from '@/hooks/useCatalog';
import { useSubscription } from '@/hooks/useSubscription';
import { PlusCircle, LayoutList, Lock } from 'lucide-react';
import type { Produto } from '@/types';

export function CatalogTab() {
  const { produtos, isLoading: isAppLoading } = useApp();
  const { addProduto, deleteProduto } = useCatalog();
  const { subscription, isLoading: isSubLoading } = useSubscription();
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  
  const isLoading = isAppLoading || isSubLoading;
  const isPremium = subscription?.active;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  const salvar = async () => {
    const p = parseFloat(preco);
    if (!nome.trim() || isNaN(p)) { 
      toast('Preencha nome e preço corretamente', 'error'); 
      return; 
    }
    await addProduto(nome.trim(), p);
    setNome(''); 
    setPreco('');
    toast('Produto registrado no catálogo!', 'success');
  };

  return (
    <div className={`grid gap-8 items-start ${isPremium ? 'grid-cols-1 lg:grid-cols-[400px_1fr]' : 'grid-cols-1'} pt-4`}>
      {/* Add New Product - Premium Only */}
      {isPremium ? (
        <div className="glass-panel border-white/[0.05] shadow-2xl overflow-hidden active:scale-[0.99] transition-transform">
          <div className="p-8 border-b border-white/[0.05] bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <PlusCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Novo Produto</h2>
                <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest">Catálogo PRO</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-text-muted px-1">Nome de Exibição</label>
              <input 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                maxLength={24} 
                placeholder="Ex: Coca-Cola 350ml" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-text-muted px-1">Preço Sugerido (R$)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                <input 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30" 
                  type="number" 
                  value={preco} 
                  onChange={e => setPreco(e.target.value)} 
                  placeholder="0.00" 
                  step="0.01" 
                />
              </div>
            </div>

            <button 
              className="btn-primary w-full h-[64px] mt-4 shadow-xl active:scale-[0.98]" 
              onClick={salvar}
            >
              Registrar no Catálogo
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 border-dashed border-primary/20 flex flex-col items-center justify-center text-center gap-4">
           <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Lock size={20} />
           </div>
           <div>
              <h3 className="text-white font-bold">Gerenciamento de Catálogo</h3>
              <p className="text-sm text-text-dim mt-1">Atualize para o Premium para salvar seus produtos e vender com apenas um clique.</p>
           </div>
        </div>
      )}

      {/* Product List */}
      <div className="glass-panel border-white/[0.05] shadow-2xl flex flex-col">
        <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-text-muted border border-white/5">
              <LayoutList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Seu Catálogo</h2>
              <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest">{produtos.length} Itens Salvos</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {produtos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-6">
                <LayoutList size={28} className="text-text-dim opacity-10" />
              </div>
              <h3 className="text-white font-semibold">Sem itens cadastrados</h3>
              <p className="text-sm text-text-dim mt-1">Comece adicionando produtos ao seu catálogo para agilizar as vendas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map((p: Produto) => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] hover:border-primary/20 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white mb-1 truncate">{p.nome}</div>
                    <div className="text-xs font-semibold text-primary">R$ {p.preco.toFixed(2).replace('.', ',')}</div>
                  </div>
                  
                  {isPremium && (
                    <button 
                      className="ml-4 p-2.5 text-text-muted hover:text-red hover:bg-red/10 rounded-xl transition-all opacity-0 group-hover:opacity-100" 
                      onClick={() => deleteProduto(p.id)}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
