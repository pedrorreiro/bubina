"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import {
  Store,
  Image as ImageIcon,
  X,
  Lock,
  Zap,
  PlusCircle,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { maskPhone } from "@/lib/utils";
import { StorageService } from "@/services/storage";
import { useDebouncedCallback } from "use-debounce";

export function SettingsTab() {
  const {
    loja,
    userId,
    updateLojaLocally,
    setLoja,
    updatePrinterStatus,
    isLoading: isAppLoading,
  } = useApp();
  const { subscription, isLoading: isSubLoading } = useSubscription();
  const isLoading = isAppLoading || isSubLoading;
  const isPremium = subscription?.active;

  useEffect(() => {
    updatePrinterStatus();
  }, [updatePrinterStatus]);

  const [localLoja, setLocalLoja] = useState(loja);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Sincroniza o local apenas quando a loja global mudar (e não for por digitação nossa)
  useEffect(() => {
    setLocalLoja(loja);
  }, [loja]);

  // 2. Debounce exclusivo para persistência dos campos de texto usando biblioteca oficial
  const debouncedSave = useDebouncedCallback((updatedLoja) => {
    setLoja(updatedLoja);
  }, 800);

  useEffect(() => {
    const fieldsToDebounce = ["nome", "telefone", "endereco", "mensagem_rodape"] as const;
    const hasChanged = fieldsToDebounce.some(f => localLoja[f] !== loja[f]);

    if (hasChanged) {
      debouncedSave({ ...loja, ...localLoja });
    }
  }, [localLoja, loja, debouncedSave, setLoja]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  // Helper para atualizações locais rápidas (inputs)
  const handleTextChange = (field: keyof typeof localLoja, value: string) => {
    setLocalLoja(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    // Preview local imediato
    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      toast.loading("Enviando logo...", { id: "upload-logo" });
      const publicUrl = await StorageService.uploadLogo(file, userId);
      
      // Ação direta: salva no banco e apaga o preview local
      await setLoja({ ...loja, logo_url: publicUrl, logo_metodo: "dither" });
      setLocalPreview(null);
      
      toast.success("Logo enviada com sucesso!", { id: "upload-logo" });
    } catch (error) {
      toast.error("Erro ao enviar logo. Tente novamente.", { id: "upload-logo" });
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = async () => {
    if (loja.logo_url) {
      await StorageService.deleteLogo(loja.logo_url);
      const newLoja = { ...loja };
      delete newLoja.logo_url;
      delete newLoja.logo_metodo;
      await setLoja(newLoja);
      toast.info("Logo removida.");
    }
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
                <h2 className="text-xl font-bold text-white tracking-tight">
                  O Estabelecimento
                </h2>
                <p className="text-[10px] text-text-dim font-semibold uppercase tracking-widest">
                  Identidade Visual do Cupom
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-text-muted px-1">
                  Nome Fantasia
                </label>
                <input
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30"
                  value={localLoja.nome || ""}
                  onChange={(e) => handleTextChange("nome", e.target.value)}
                  placeholder="Ex: Panificadora Central"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-text-muted px-1">
                  Contato / WhatsApp
                </label>
                <input
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30 tabular-nums"
                  value={localLoja.telefone || ""}
                  onChange={(e) => handleTextChange("telefone", maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-text-muted px-1">
                Endereço Completo
              </label>
              <input
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30"
                value={localLoja.endereco || ""}
                onChange={(e) => handleTextChange("endereco", e.target.value)}
                placeholder="Rua das Flores, 123"
              />
            </div>

            {isPremium ? (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-text-muted px-1">
                  Rodapé do Cupom
                </label>
                <input
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/30"
                  value={localLoja.mensagem_rodape || ""}
                  onChange={(e) => handleTextChange("mensagem_rodape", e.target.value)}
                  placeholder="Ex: Obrigado pela preferência!"
                />
                <p className="text-[10px] text-text-dim px-1">
                  Frase curta que aparece no final de todos os seus cupons.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rodapé Personalizado</p>
                  <p className="text-[11px] text-text-dim mt-1">
                    Assine o plano Pro para remover ou alterar a frase padrão no fim do cupom.
                  </p>
                </div>
              </div>
            )}

            <div className="w-full h-[1px] bg-white/5" />

            {isPremium ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-semibold text-text-muted">
                    Logomarca do Comprovante
                  </label>
                </div>

                {!loja.logo_url ? (
                  <div className="relative group overflow-hidden rounded-2xl">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 transition-all group-hover:border-primary/40 group-hover:bg-primary/5 min-h-[180px]">
                      {localPreview ? (
                        <div className="relative group/preview">
                          <img 
                            src={localPreview} 
                            alt="Preview" 
                            className={`h-24 w-auto object-contain rounded-lg shadow-2xl transition-all ${isUploading ? 'opacity-40 grayscale blur-[2px]' : ''}`}
                          />
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-text-dim transition-transform group-hover:scale-110">
                            <PlusCircle size={24} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest text-center">
                              Selecionar Logomarca
                            </p>
                            <p className="text-[10px] text-text-dim mt-2 font-medium text-center">
                              SVG, PNG ou JPG (Otimizado para térmicas)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-6 bg-primary/5 border border-primary/20 rounded-2xl group">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden p-2">
                        <img 
                          src={loja.logo_url} 
                          alt="Logo da Loja" 
                          className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Logomarca Ativada
                        </p>
                        <p className="text-xs text-text-dim font-medium mt-1">
                          Sua marca será impressa no topo do cupom.
                        </p>
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
                  <p className="text-xs font-bold text-white">Logo no Cupom</p>
                  <p className="text-[11px] text-text-dim mt-1">
                    Assine o plano Pro para adicionar sua identidade visual aos
                    recibos.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <Zap size={14} className="text-primary" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                Salvamento Automático: Suas alterações são salvas e protegidas
                na nuvem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
