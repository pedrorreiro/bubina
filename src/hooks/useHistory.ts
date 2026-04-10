import { useApp } from '@/context/AppContext';
import { deleteHistorico as storageDelHist } from '@/services/storage';
import type { HistoricoPedido } from '@/types';

/**
 * Hook para gerenciar as operações do histórico de pedidos.
 */
export function useHistory() {
  const { setHistorico } = useApp();

  const deleteHistorico = async (id: string) => {
    await storageDelHist(id);
    setHistorico((prev: HistoricoPedido[]) => prev.filter((h: HistoricoPedido) => h.id !== id));
  };

  return { deleteHistorico };
}
