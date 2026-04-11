import { request } from "./base";
import type { Produto } from "../../types";

export const produtosApi = {
  list: () => request<Produto[]>("/api/produtos"),

  add: (nome: string, preco: number) =>
    request<Produto>("/api/produtos", {
      method: "POST",
      body: JSON.stringify({ nome, preco }),
    }),

  delete: (id: string) =>
    request(`/api/produtos/${id}`, { method: "DELETE" }),
};
