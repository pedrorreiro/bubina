import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg relative overflow-hidden">
      {/* Background Decor que combina com o Login */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative flex flex-col items-center">
        {/* Spinner Premium com gradiente */}
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        </div>

        {/* Logo/Branding discreto abaixo do spinner */}
        <div className="mt-8 flex flex-col items-center animate-pulse">
          <h1 className="text-xl font-black text-white mt-2 tracking-tighter uppercase opacity-30">
            Thermal<span className="text-primary italic">Pro</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
