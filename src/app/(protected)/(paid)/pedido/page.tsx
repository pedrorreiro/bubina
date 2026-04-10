'use client';

import { useEffect } from 'react';
import { OrderTab } from '@/components/order/OrderTab';
import { useApp } from '@/context/AppContext';
import { getProdutos, getLoja } from '@/services/storage';

export default function PedidoPage() {
  const { 
    isLoading,
    setProdutos,
    setLojaState,
    setHasLoja
  } = useApp();

  useEffect(() => {
    async function loadData() {
      try {
        const [p, l] = await Promise.all([getProdutos(), getLoja()]);
        setProdutos(p);
        if (l) {
          setLojaState(l);
          setHasLoja(true);
        }
      } catch (e) {
        console.error("Erro ao carregar dados da página de pedidos:", e);
      }
    }
    loadData();
  }, [setProdutos, setLojaState, setHasLoja]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <OrderTab />
  );
}
