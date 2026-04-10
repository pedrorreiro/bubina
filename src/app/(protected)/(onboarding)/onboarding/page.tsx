'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Store, Phone, ArrowRight, Printer, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const { setLoja, loja } = useApp();
  const router = useRouter();
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
      // After success, redirect to pedido
      router.push('/pedido');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Printer size={32} className="text-primary relative z-10" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            Bem-vindo ao <span className="text-primary italic">Bubina</span>
          </h1>
          <p className="text-text-dim font-bold text-center text-sm uppercase tracking-[0.2em]">
            Configuração do seu negócio
          </p>
        </div>

        <div className="solid-card p-8 sm:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-text-dim uppercase tracking-[0.3em] px-1">
                <Store size={14} className="text-primary" /> Nome do Estabelecimento
              </label>
              <input 
                required
                className="w-full bg-bg border border-border rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/20" 
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Pizzaria do Vale"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-text-dim uppercase tracking-[0.3em] px-1">
                <Phone size={14} className="text-primary" /> Telefone de Contato
              </label>
              <input 
                required
                className="w-full bg-bg border border-border rounded-xl px-5 py-4 text-sm font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-dim/20" 
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-4 pt-4">
              <button 
                disabled={isSubmitting || !nome.trim() || !telefone.trim()}
                className="btn-primary w-full h-16 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] shadow-xl disabled:opacity-50 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>COMEÇAR A VENDER</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={handleLogout}
                className="w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black text-text-dim hover:text-white uppercase tracking-widest transition-all"
              >
                <LogOut size={14} />
                SAIR DA CONTA
              </button>
            </div>
          </form>
        </div>

        <p className="mt-10 text-center text-[9px] font-black text-text-dim uppercase tracking-widest leading-relaxed">
          Ao prosseguir, você concorda que o <span className="text-white">Bubina</span> processe seus dados com segurança na nuvem.
        </p>
      </motion.div>
    </div>
  );
}
