"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  Bluetooth,
  Settings,
  Package,
  FileText,
  History,
  Unplug,
  User,
  LogOut,
} from "lucide-react";

export function Header() {
  const {
    printerName,
    printerStatus,
    authorizedDevice,
    connectPrinter,
    disconnectPrinter,
    userEmail
  } = useApp();
  const [showStatusDetail, setShowStatusDetail] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.status === 200) {
        setShowUserMenu(false);
        // O Middleware ou o AppContext redirecionarão após o reload ou mudança de estado
        window.location.href = "/";
      } else {
        toast.error("Erro ao sair");
      }
    } catch (e) {
      toast.error("Erro de conexão ao sair");
    }
  };

  if (pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  const handleConnect = async (device?: BluetoothDevice) => {
    try {
      await connectPrinter(device).then(() => {
        toast.success("Impressora conectada!");
      }).catch(e => {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(`Falha: ${msg}`);
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("User cancelled")) {
        toast.error(`Falha: ${msg}`);
      }
    }
  };

  const tabs = [
    { id: "pedido", path: "/pedido", label: "Pedido", icon: FileText },
    { id: "historico", path: "/historico", label: "Histórico", icon: History },
    { id: "produtos", path: "/produtos", label: "Produtos", icon: Package },
    { id: "ajustes", path: "/ajustes", label: "Ajustes", icon: Settings },
  ];

  return (
    <>
      <header className="fixed top-4 left-4 right-4 h-16 z-[1000] flex items-center px-6 glass-panel md:px-8 max-w-7xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between w-full">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <div
              className={`
              flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] transition-all relative group
              ${printerStatus === "connected" ? "border-primary/30" : ""}
            `}
            >
              <Printer
                size={18}
                className={`transition-colors duration-500 ${
                  printerStatus === "connected" ? "text-primary" : "text-text-muted"
                }`}
              />
              <div
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0f1115] transition-all duration-500
                 ${
                   printerStatus === "connected"
                     ? "bg-green shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                     : printerStatus === "connecting"
                       ? "bg-yellow shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                       : "bg-red shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                 }`}
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              Bubina
            </span>
          </div>

          {/* Center: Navigation (Desktop) */}
          <div className="hidden md:flex items-center bg-black/20 p-1 rounded-xl border border-white/5 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                pathname === tab.path ||
                (tab.path === "/pedido" && pathname === "/");

              return (
                <Link
                  key={tab.id}
                  href={tab.path}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 relative
                    ${isActive 
                      ? "text-primary bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                      : "text-text-muted hover:text-white hover:bg-white/[0.03]"}
                  `}
                >
                  <Icon size={14} className={isActive ? "text-primary" : "text-text-dim group-hover:text-white"} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-2 right-2 h-[2px] bg-primary/40 blur-[1px] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            {userEmail && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowStatusDetail(false);
                  }}
                  className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-primary/50 transition-all"
                >
                  <User size={16} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute top-[calc(100%+12px)] right-0 min-w-[220px] glass-panel p-2 z-[1100] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                      <div className="p-4 border-b border-white/[0.05] mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-dim mb-1.5">
                          Sua Conta
                        </p>
                        <p className="text-sm font-semibold text-white truncate">
                          {userEmail}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red hover:bg-red/10 transition-all text-left group"
                      >
                        <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">
                          Sair da Conta
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Printer Status */}
            <div className="relative">
              <div
                className="status-pill h-10 px-4 sm:px-5 cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 transition-all"
                onClick={() => {
                  setShowStatusDetail(!showStatusDetail);
                  setShowUserMenu(false);
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${printerStatus === "connected" ? "bg-green shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`}
                />
                <span className="hidden sm:inline text-xs font-semibold tracking-wide">
                  {printerStatus === "connected" ? "Online" : "Offline"}
                </span>
                <span className="sm:hidden text-[10px] font-bold">
                  {printerStatus === "connected" ? "ON" : "OFF"}
                </span>
              </div>

              <AnimatePresence>
                {showStatusDetail && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute top-[calc(100%+12px)] right-0 min-w-[280px] glass-panel p-5 z-[1100] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex justify-between items-center mb-6 px-1">
                      <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.15em]">
                        Hardware
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          printerStatus === "connected"
                            ? "bg-green/10 text-green border border-green/20"
                            : "bg-red/10 text-red border border-red/20"
                        }`}
                      >
                        {printerStatus}
                      </span>
                    </div>

                    {printerStatus === "connected" && (
                      <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.05] mb-5 group">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                          <Printer size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-muted font-medium mb-0.5 uppercase tracking-tighter">Impressora Ativa</span>
                          <span className="text-sm font-bold text-white tracking-tight">
                            {printerName || "Impressora Padrão"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {printerStatus === "connected" ? (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red/10 text-red text-[11px] font-bold uppercase tracking-wider border border-red/20 hover:bg-red hover:text-white transition-all shadow-lg shadow-red/5"
                          onClick={() => {
                            disconnectPrinter();
                            setShowStatusDetail(false);
                          }}
                        >
                          <Unplug size={14} /> Desconectar
                        </button>
                      ) : (
                        <button
                          className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5"
                          onClick={() => {
                            handleConnect(authorizedDevice || undefined);
                            setShowStatusDetail(false);
                          }}
                          disabled={printerStatus === "connecting"}
                        >
                          <Bluetooth size={16} />
                          <span className="text-[11px] uppercase tracking-wider">{authorizedDevice ? "Reconectar" : "Conectar"}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Floating Pill Style */}
      <nav className="fixed bottom-6 left-4 right-4 h-16 glass-panel z-[1000] flex justify-around items-center px-4 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.path ||
            (tab.path === "/pedido" && pathname === "/");

          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`
                flex flex-col items-center gap-0.5 p-1 w-1/4 transition-all duration-300 relative
                ${isActive ? "text-primary scale-110" : "text-text-dim opacity-70"}
              `}
            >
              <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : ""} />
              <span
                className={`text-[8px] font-bold uppercase tracking-widest transition-all ${isActive ? "opacity-100" : "opacity-40"}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute -bottom-1 w-6 h-[3px] bg-primary/60 blur-[1px] rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
