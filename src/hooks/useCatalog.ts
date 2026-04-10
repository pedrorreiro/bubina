import { useApp } from '@/context/AppContext';
import { addProduto as storageAddProd, deleteProduto as storageDelProd } from '@/services/storage';
import type { Produto } from '@/types';

/**
 * Hook para gerenciar as operações do catálogo de produtos.
 * Encapsula a lógica de backend e atualização de estado global.
 */
export function useCatalog() {
  const { setProdutos } = useApp();

  const addProduto = async (nome: string, preco: number) => {
    const novo = await storageAddProd(nome, preco);
    setProdutos((prev: Produto[]) => [...prev, novo]);
  };

  const deleteProduto = async (id: string) => {
    await storageDelProd(id);
    setProdutos((prev: Produto[]) => prev.filter((p: Produto) => p.id !== id));
  };

  return { addProduto, deleteProduto };
}
