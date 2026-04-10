'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Phone, ArrowRight, Printer } from 'lucide-react';

export function StoreOnboarding() {
  const { setLoja, loja } = useApp();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;

    setIsSubmitting(true);
    try {
      await setLoja({
        ...loja,
        nome: nome.trim(),
        telefone: telefone.trim(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020305] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs - More Cinematic */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Mesh Gradient Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.02),transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 glass-panel flex items-center justify-center mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500" />
            <Printer size={36} className="text-primary relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-3">
              Thermal<span className="text-primary italic">Pro</span>
            </h1>
            <p className="text-text-dim font-semibold text-center text-[10px] uppercase tracking-[0.4em]">
              SaaS Operational Framework
            </p>
          </motion.div>
        </div>

        <div className="glass-panel p-10 sm:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] border-white/[0.05]">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Configuração Inicial</h2>
            <p className="text-sm text-text-dim font-medium">Preencha os dados do seu estabelecimento para começar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-text-muted px-1 uppercase tracking-wider">
                Nome do Negócio
              </label>
              <div className="relative group">
                <Store size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
                <input 
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-semibold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/20" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Pizzaria Gourmet"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-text-muted px-1 uppercase tracking-wider">
                Contato Comercial
              </label>
              <div className="relative group">
                <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
                <input 
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/20 tabular-nums" 
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  placeholder="(00) 12345-6789"
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting || !nome.trim() || !telefone.trim()}
              className="btn-primary w-full h-[72px] mt-4 flex items-center justify-center gap-4 text-sm font-bold shadow-2xl disabled:opacity-30 group active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest">Ativar Workspace</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
            Seus dados são criptografados e <span className="text-white">sincronizados em tempo real</span>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
