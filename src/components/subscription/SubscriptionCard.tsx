"use client";

import { useState, useEffect } from "react";
import { useSubscription, SubscriptionStatus } from "@/hooks/useSubscription";
import { useToast } from "@/context/ToastContext";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Loader2,
  Zap,
  ArrowRight,
} from "lucide-react";

export function SubscriptionCard() {
  const { subscription: sub, isLoading, openPortal } = useSubscription();

  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      await openPortal();
    } catch (e) {
      toast("Erro ao abrir o portal de assinatura", "error");
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!sub) return null;

  const trialEndTime = sub.trialEndsAt
    ? new Date(sub.trialEndsAt).getTime()
    : 0;
  const msRemaining = Math.max(0, trialEndTime - now);
  const hoursRemaining = msRemaining / (1000 * 60 * 60);
  const trialDaysRemaining = Math.ceil(hoursRemaining / 24);

  const formatTrialTime = () => {
    if (msRemaining <= 0) return "Expirado";
    const totalMinutes = Math.floor(msRemaining / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    if (days >= 1) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    return hours >= 1 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const statusConfig = getStatusConfig(sub, trialDaysRemaining);

  return (
    <div className="glass-panel overflow-hidden relative group">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-primary/10" />

      <div className="relative p-8 sm:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Assinatura & Plano
            </h2>
            <p className="text-[10px] text-text-dim font-semibold uppercase tracking-widest">
              Controle de Faturamento
            </p>
          </div>
        </div>

        {/* Status Area */}
        <div
          className={`p-6 rounded-2xl border transition-all duration-500 mb-8 ${statusConfig.bgClass}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 ${statusConfig.iconClass}`}
            >
              <statusConfig.icon size={20} />
            </div>
            <div>
              <p
                className={`text-sm font-bold tracking-tight ${statusConfig.textClass}`}
              >
                {statusConfig.label}
              </p>
              <p className="text-xs text-text-dim font-medium mt-0.5">
                {statusConfig.description}
              </p>
            </div>
          </div>

          {/* Trial Progress Bar */}
          {sub.reason === "trial" && msRemaining > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                  Tempo Restante de Trial
                </span>
                <span className="text-xs font-bold text-primary tabular-nums">
                  {formatTrialTime()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                  style={{
                    width: `${Math.min(100, (hoursRemaining / 72) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions & Plan Info */}
        <div className="space-y-4">
          {sub.reason === "paid" ? (
            <button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="w-full h-[60px] flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-30 group"
            >
              {portalLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ExternalLink
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              )}
              Gerenciar no Portal Stripe
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-primary/40 rounded-full" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    Vantagens do Plano Pro
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    "Impressões Ilimitadas",
                    "Catálogo de Produtos",
                    "Logotipo no Cupom",
                    "Suporte Prioritário",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span className="text-[11px] font-semibold text-text-muted">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="/paywall"
                className="btn-primary w-full h-[68px] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] group"
              >
                <Zap size={18} className="fill-white" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[13px] font-bold uppercase tracking-widest">
                    Assinar ThermalPro
                  </span>
                  <span className="text-[10px] font-medium opacity-70">
                    Apenas R$ 20,00 por mês
                  </span>
                </div>
                <ArrowRight
                  size={18}
                  className="ml-auto opacity-40 transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusConfig(sub: SubscriptionStatus, trialDays: number) {
  if (sub.reason === "trial") {
    if (trialDays <= 1) {
      return {
        icon: Zap,
        label: "Avaliação Pro Terminando",
        description:
          "Seu período de recursos liberados está acabando. Mantenha-os ativos assinando agora!",
        bgClass: "bg-yellow/5 border-yellow/20",
        iconClass: "text-yellow",
        textClass: "text-yellow",
      };
    }
    return {
      icon: Zap,
      label: "Recursos Pro Liberados",
      description: `Você tem ${trialDays} dias de Pro grátis. Aproveite!`,
      bgClass: "bg-primary/5 border-primary/20",
      iconClass: "text-primary",
      textClass: "text-primary",
    };
  }

  if (sub.reason === "paid") {
    if (sub.subscriptionStatus === "past_due") {
      return {
        icon: AlertTriangle,
        label: "Pagamento Pendente",
        description: "Houve um problema com o pagamento. Atualize seu método.",
        bgClass: "bg-yellow/5 border-yellow/20",
        iconClass: "text-yellow",
        textClass: "text-yellow",
      };
    }
    return {
      icon: CheckCircle2,
      label: "Plano Ativo",
      description: "Sua assinatura está ativa e em dia.",
      bgClass: "bg-green/5 border-green/20",
      iconClass: "text-green",
      textClass: "text-green",
    };
  }

  return {
    icon: Zap,
    label: "Plano Starter (Grátis)",
    description:
      "Você está no plano básico com limites de impressão e recursos.",
    bgClass: "bg-white/5 border-border",
    iconClass: "text-text-muted",
    textClass: "text-white",
  };
}
