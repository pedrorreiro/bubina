import Link from "next/link";
import {
  Printer,
  Zap,
  Cloud,
  Shield,
  ArrowRight,
  Receipt,
  Smartphone,
  Bluetooth,
  Star,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubina — PDV Inteligente para Impressoras Térmicas",
  description:
    "Imprima cupons fiscais direto do celular via Bluetooth. Sem fio, sem complicação. O ponto de venda mais rápido para o seu negócio.",
};

const features = [
  {
    icon: Bluetooth,
    title: "Bluetooth Nativo",
    desc: "Conecte direto à sua impressora térmica sem fio, cabos ou drivers.",
  },
  {
    icon: Zap,
    title: "Venda em Segundos",
    desc: "Monte a comanda, imprima o cupom e passe pro próximo cliente.",
  },
  {
    icon: Cloud,
    title: "Tudo na Nuvem",
    desc: "Histórico, catálogo e configurações sincronizados entre dispositivos.",
  },
  {
    icon: Shield,
    title: "Seguro & Privado",
    desc: "Dados criptografados. Só você tem acesso ao seu estabelecimento.",
  },
];

const steps = [
  {
    num: "01",
    icon: Smartphone,
    title: "Abra no celular",
    desc: "Acesse pelo navegador — sem instalar nada.",
  },
  {
    num: "02",
    icon: Bluetooth,
    title: "Conecte a impressora",
    desc: "Pareie via Bluetooth com um toque.",
  },
  {
    num: "03",
    icon: Receipt,
    title: "Venda & imprima",
    desc: "Monte o pedido e imprima o cupom na hora.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg text-text overflow-x-hidden">
      {/* ── Decoração de fundo ──────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(91,156,245,0.12),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-edge) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-raised shadow-sm">
            <Printer size={20} className="text-primary" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Bubina
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-white/[0.07] px-5 py-2 text-sm font-semibold text-white ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.12] hover:ring-white/20"
        >
          Entrar
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-16 text-center md:px-10 md:pb-28 md:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Star size={13} className="fill-primary" />
          PDV para Impressoras Térmicas
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
          Imprima cupons direto do{" "}
          <span className="bg-gradient-to-r from-primary to-blue-300 bg-clip-text text-transparent">
            celular
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-text-muted sm:text-lg">
          Conecte sua impressora Bluetooth, monte a comanda e imprima — sem
          fio, sem complicação. O PDV mais rápido para o seu negócio.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-[0_0_32px_rgba(91,156,245,0.3)] transition-all hover:bg-primary-hover hover:shadow-[0_0_48px_rgba(91,156,245,0.4)]"
          >
            Começar agora
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-dim">
            <CheckCircle2 size={14} className="text-green" />
            Gratuito · sem cartão de crédito
          </span>
        </div>

        {/* Mockup impressora */}
        <div className="relative mt-16 md:mt-20">
          <div className="absolute -inset-12 -z-10 rounded-full bg-primary/[0.06] blur-[80px]" />
          <div className="relative mx-auto w-[240px] md:w-[280px]">
            <div className="relative z-10 rounded-t-2xl border border-border border-b-0 bg-surface-raised px-6 pb-4 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="mx-auto mb-4 flex h-2.5 w-[68%] rounded-full bg-black/30 shadow-inner" />
              <div className="mx-auto h-1 w-[85%] rounded-full bg-primary/25" />

              <div className="relative mt-1 flex justify-center">
                <div className="animate-loading-receipt-feed relative w-[80%] origin-top">
                  <div className="relative overflow-hidden rounded-b-lg border border-black/10 border-t-0 bg-[#eceae4] px-4 pb-6 pt-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                    <div
                      className="pointer-events-none absolute inset-0 animate-loading-receipt-shine opacity-90"
                      aria-hidden
                    />
                    <div className="relative space-y-2.5">
                      <div className="mx-auto h-1 w-[55%] rounded-full bg-black/15" />
                      <div className="h-1 w-full rounded-full bg-black/10" />
                      <div className="h-1 w-[92%] rounded-full bg-black/10" />
                      <div className="h-1 w-[78%] rounded-full bg-black/10" />
                      <div className="h-1 w-[88%] rounded-full bg-black/10" />
                      <div className="pt-1">
                        <div className="mx-auto h-7 w-[70%] rounded border border-dashed border-black/15 bg-black/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-0 -mt-1 mx-auto h-3 w-[85%] rounded-full bg-gradient-to-b from-surface to-bg shadow-inner ring-1 ring-edge" />
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 md:px-10 md:pb-28">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-edge bg-surface p-6 shadow-sm transition hover:border-primary/20 hover:shadow-[0_0_32px_rgba(91,156,245,0.06)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                <f.icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-white">
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-text-muted">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10 md:pb-32">
        <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Como funciona
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-sm text-text-muted">
          Três passos e você já está vendendo. Sem instalação, sem cadastro
          de equipamentos.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="relative flex flex-col items-center rounded-2xl border border-edge bg-surface/60 p-8 text-center backdrop-blur-sm"
            >
              <span className="absolute -top-4 left-6 font-black text-5xl text-white/[0.04]">
                {s.num}
              </span>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-raised text-primary shadow-sm">
                <s.icon size={26} strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-sm font-bold text-white">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-text-muted">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto mb-8 max-w-3xl px-6 md:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] to-transparent p-10 text-center shadow-[0_0_64px_rgba(91,156,245,0.08)] sm:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-[80px]" />
          <h2 className="relative mb-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Pronto para vender mais rápido?
          </h2>
          <p className="relative mx-auto mb-8 max-w-md text-sm leading-relaxed text-text-muted">
            Crie sua conta em menos de um minuto e conecte sua impressora
            térmica hoje mesmo.
          </p>
          <Link
            href="/login"
            className="group relative inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-[0_0_32px_rgba(91,156,245,0.3)] transition-all hover:bg-primary-hover hover:shadow-[0_0_48px_rgba(91,156,245,0.4)]"
          >
            Criar conta grátis
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-t border-edge px-6 py-6 md:px-10">
        <div className="flex items-center gap-2">
          <Printer size={16} className="text-text-dim" />
          <span className="text-xs font-semibold text-text-dim">Bubina</span>
        </div>
        <span className="text-[11px] text-text-dim">
          © {new Date().getFullYear()} Todos os direitos reservados
        </span>
      </footer>
    </div>
  );
}
