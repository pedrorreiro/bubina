"use client";

import { useState } from "react";
import { PlanCard } from "@/components/subscription/PlanCard";
import { useSubscription } from "@/hooks/useSubscription";
import { Zap, Shield, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaywallPage() {
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);

  const handleCheckout = async (priceType: "monthly" | "annual") => {
    setLoading(priceType);
    try {
      await createCheckout(priceType);
    } catch (e) {
      console.error("Erro ao criar checkout:", e);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#020305] px-6 py-20 relative overflow-x-hidden">
      {/* Background Decor - Cinematic Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-xl"
          >
            <Zap size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-dim">
              Explore o Próximo Nível
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Eleve sua Operação com o <span className="text-primary italic">Pro</span>
          </h1>

          <p className="text-base text-text-dim max-w-xl mx-auto leading-relaxed">
            Abandone os limites do plano gratuito e desbloqueie ferramentas profissionais de alta performance desenhadas para o seu crescimento.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <PlanCard
            title="Assinatura Mensal"
            price="R$ 20"
            period="/mês"
            description="Flexibilidade total para o seu dia a dia. Desbloqueie o potencial máximo."
            features={[
              "Recibos Ilimitados",
              "Catálogo de Produtos",
              "Logotipo no Cupom",
              "Histórico Completo",
            ]}
            onSelect={() => handleCheckout("monthly")}
            loading={loading === "monthly"}
            disabled={loading !== null}
          />

          <PlanCard
            title="Assinatura Anual"
            price="R$ 200"
            period="/ano"
            description="O máximo de economia para negócios consolidados. Pagamento único."
            badge="17% DE ECONOMIA"
            features={[
              "Tudo do plano Mensal",
              "2 meses de bônus",
              "Prioridade em Features",
              "Suporte VIP",
            ]}
            highlighted
            onSelect={() => handleCheckout("annual")}
            loading={loading === "annual"}
            disabled={loading !== null}
          />
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-text-muted mb-24 opacity-60">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Checkout Seguro Stripe
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Ativação Instantânea
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Sem Multas de Cancelamento
            </span>
          </div>
        </div>

        {/* Plan Comparison Table */}
        <div className="glass-panel overflow-hidden border-white/[0.05] shadow-2xl mb-12">
          <div className="p-8 md:p-12 border-b border-white/[0.05] bg-white/[0.01]">
            <div className="text-center">
              <h3 className="text-xs font-bold text-primary uppercase tracking-[0.4em] mb-3">
                Visão Detalhada
              </h3>
              <p className="text-xl font-bold text-white tracking-tight">
                Compare as Versões
              </p>
            </div>
          </div>

          <div className="p-2 md:p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-6 text-left text-[11px] font-bold text-text-dim uppercase tracking-widest">Funcionalidade</th>
                    <th className="px-6 py-6 text-center text-[11px] font-bold text-text-dim uppercase tracking-widest">Free</th>
                    <th className="px-6 py-6 text-center text-[11px] font-bold text-primary uppercase tracking-widest">Elite Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {[
                    { label: "Limite de Impressões", free: "15 por dia", pro: "Ilimitado" },
                    { label: "Catálogo de Itens", free: "---", pro: "Ilimitado" },
                    { label: "Branding no Cupom", free: "ThermalPro Logo", pro: "Seu Logotipo" },
                    { label: "Vendas Manuais", free: "Liberado", pro: "Liberado" },
                    { label: "Suporte Técnico", free: "Base de Conhecimento", pro: "Chat Prioritário" },
                    { label: "Backup em Nuvem", free: "Síncrono", pro: "Síncrono + Histórico VIP" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-6">
                        <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{row.label}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-xs font-medium text-text-dim/50">{row.free}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-bold text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">{row.pro}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Secondary Back Link */}
        <div className="text-center pt-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-text-dim hover:text-white transition-all text-sm font-bold"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Voltar ao Painel
          </Link>
        </div>
      </div>
    </div>
  );
}
