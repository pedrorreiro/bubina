'use client';

import { Check, Loader2, ArrowRight } from 'lucide-react';

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
  onSelect: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PlanCard({
  title,
  price,
  period,
  description,
  features,
  badge,
  highlighted = false,
  onSelect,
  loading = false,
  disabled = false,
}: PlanCardProps) {
  return (
    <div
      className={`
        relative flex flex-col p-10 rounded-3xl border transition-all duration-500 overflow-hidden group
        ${highlighted
          ? 'bg-primary/[0.03] border-primary/30 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] ring-1 ring-primary/20 scale-[1.02]'
          : 'glass-panel border-white/[0.05] hover:border-white/10'
        }
      `}
    >
      {/* Visual Glow for highlighted */}
      {highlighted && (
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-6 right-6">
          <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg backdrop-blur-md">
            {badge}
          </span>
        </div>
      )}

      {/* Plan Title & Pricing */}
      <div className="mb-8">
        <h3 className={`text-[11px] font-bold uppercase tracking-[0.3em] mb-4 ${highlighted ? 'text-primary' : 'text-text-dim'}`}>
          {title}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold text-white tracking-tight">{price}</span>
          <span className="text-sm font-semibold text-text-dim">{period}</span>
        </div>
        <p className="text-xs text-text-muted mt-3 font-medium leading-relaxed opacity-80">{description}</p>
      </div>

      <div className="w-full h-[1px] bg-white/5 mb-8" />

      {/* Features */}
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3.5">
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center border transition-colors
              ${highlighted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-text-dim'}
            `}>
              <Check size={10} strokeWidth={3} />
            </div>
            <span className="text-[13px] font-semibold text-text-muted transition-colors group-hover:text-white/90">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        disabled={disabled || loading}
        className={`
          w-full h-14 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300
          flex items-center justify-center gap-2.5 active:scale-[0.98]
          ${highlighted
            ? 'btn-primary shadow-xl shadow-primary/20'
            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
          }
          disabled:opacity-30 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processando
          </>
        ) : (
          <>
            Assinar Agora
            <ArrowRight size={16} className={`opacity-40 transition-transform group-hover:translate-x-1 ${highlighted ? 'block' : 'hidden md:block'}`} />
          </>
        )}
      </button>
    </div>
  );
}
