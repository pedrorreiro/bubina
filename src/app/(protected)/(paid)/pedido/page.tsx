"use client";

import { useEffect } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { OrderTab } from "@/components/order/OrderTab";
import { useApp } from "@/context/AppContext";
import { getProdutos, getLoja } from "@/services/api";

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
      <Center py="32">
        <Spinner size="lg" color="#5b9cf5" borderWidth="4px" />
      </Center>
    );
  }

  return (
    <OrderTab />
  );
}
