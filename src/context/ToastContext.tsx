'use client';
import { useState, useCallback, type ReactNode } from 'react';

// ── Toast system ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}

let _id = 0;

interface ToastContextValue {
  toasts: Toast[];
  toast: (msg: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}

import { createContext, useContext } from 'react';

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

// ── ToastContainer ────────────────────────────────────────────────────────────

function ToastContainer() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => dismiss(t.id)}
        >
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
