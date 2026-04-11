import { request } from "./base";
import type { HistoricoPedido } from "../../types";

export const pedidosApi = {
  list: () => request<HistoricoPedido[]>("/api/pedidos"),

  add: (pedido: Omit<HistoricoPedido, "id" | "created_at" | "user_id">) =>
    request<HistoricoPedido>("/api/pedidos", {
      method: "POST",
      body: JSON.stringify(pedido),
    }),

  delete: (id: string) =>
    request(`/api/pedidos/${id}`, { method: "DELETE" }),
};
