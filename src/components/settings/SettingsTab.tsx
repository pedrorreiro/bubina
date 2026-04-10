'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { Store, Image as ImageIcon, X, Lock, Zap, PlusCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function SettingsTab() {
  const { loja, setLoja, updatePrinterStatus, isLoading: isAppLoading } = useApp();
  const { toast } = useToast();
  const { subscription, isLoading: isSubLoading } = useSubscription();
  const isLoading = isAppLoading || isSubLoading;
  const isPremium = subscription?.active;

  useEffect(() => {
    updatePrinterStatus();
  }, [updatePrinterStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  const handleSaveLoja = (field: keyof typeof loja, value: any) => {
    setLoja({ ...loja, [field]: value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Por favor, selecione uma imagem válida.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetWidth = 240;
        const scale = targetWidth / img.width;
        const targetHeight = Math.floor(img.height * scale);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        const grayscaleData = new Uint8Array(targetWidth * targetHeight);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          grayscaleData[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        let binary = '';
        for (let i = 0; i < grayscaleData.length; i++) {
          binary += String.fromCharCode(grayscaleData[i]);
        }
        const base64Raw = btoa(binary);

        setLoja({
          ...loja,
          logo_raw: JSON.stringify({
            width: targetWidth,
            height: targetHeight,
            data: base64Raw
          }),
          logo_metodo: 'dither'
        });
        toast('Logo processada com sucesso!', 'success');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    const newLoja = { ...loja };
    delete newLoja.logo_raw;
    delete newLoja.logo_metodo;
    setLoja(newLoja);
    toast('Logo removida.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-0 space-y-8 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
        
        {/* Coluna Esquerda: Assinatura */}
        <div className="space-y-8 h-full">
          <SubscriptionCard />
        </div>
        
        {/* Coluna Direita: Informações da Loja */}
        <div className="glass-panel overflow-hidden border-white/[0.05] shadow-2xl h-full flex flex-col">
          <div className="p-8 border-b border-white/[0.05] bg-white/[0.01]">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
                <Store size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">O Estabelecimento</h2>
                <p className="text-[10px] text-text-dim font-semibold uppercase tracking-widest">Identidade Visual do Cupom</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-text-muted px-1">Nome Fantasia</label>
                <input 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30" 
                  value={loja.nome} 
                  onChange={e => handleSaveLoja('nome', e.target.value)} 
                  placeholder="Ex: Panificadora Central" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-text-muted px-1">Contato / WhatsApp</label>
                <input 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30 tabular-nums" 
                  value={loja.telefone} 
                  onChange={e => handleSaveLoja('telefone', e.target.value)} 
                  placeholder="(00) 00000-0000" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-text-muted px-1">Endereço Completo</label>
              <input 
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30" 
                value={loja.endereco} 
                onChange={e => handleSaveLoja('endereco', e.target.value)} 
                placeholder="Rua das Flores, 123" 
              />
            </div>
  
            <div className="w-full h-[1px] bg-white/5" />
  
            {isPremium ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-semibold text-text-muted">Logotipo do Comprovante</label>
                </div>
  
                {!loja.logo_raw ? (
                  <div className="relative group overflow-hidden rounded-2xl">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 transition-all group-hover:border-primary/40 group-hover:bg-primary/5">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-text-dim transition-transform group-hover:scale-110">
                         <PlusCircle size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-widest text-center">Selecionar Logotipo</p>
                        <p className="text-[10px] text-text-dim mt-2 font-medium text-center">SVG, PNG ou JPG (Otimizado para térmicas)</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-6 bg-primary/5 border border-primary/20 rounded-2xl group">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                        <ImageIcon size={24} className="text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Logotipo Ativado</p>
                        <p className="text-xs text-text-dim font-medium mt-1">Sua marca será impressa no topo do cupom.</p>
                      </div>
                    </div>
                    <button 
                      onClick={removeLogo}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-red/5 border border-red/10 text-red hover:bg-red hover:text-white transition-all shadow-lg shadow-red/5"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Lock size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-white">Logo no Cupom (Recurso Pro)</p>
                    <p className="text-[11px] text-text-dim mt-1">Assine o plano Pro para adicionar sua identidade visual aos recibos.</p>
                 </div>
              </div>
            )}
  
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <Zap size={14} className="text-primary" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                Sincronização Ativa: Suas alterações são salvas automaticamente na nuvem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
