"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Loja,
  Pedido,
  Produto,
  ItemPedido,
  HistoricoPedido,
} from "../types";
import { BluetoothPrinter } from "../services/bluetooth";
import { renderizarCupom } from "../services/cupom";
import { processLogo } from "../services/image";
import { DEFAULT_LOJA } from "../types";
import { 
  addToHistorico as storageAddHist, 
  saveLoja 
} from "../services/storage";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasLoja: boolean;

  // Printer
  printer: BluetoothPrinter | null;
  printerName: string | null;
  printerStatus: "disconnected" | "connecting" | "connected" | "error";
  connectPrinter: (manualDevice?: BluetoothDevice) => Promise<void>;
  disconnectPrinter: () => void;
  updatePrinterStatus: () => void;
  printCupom: (pedido: Pedido) => Promise<void>;
  authorizedDevice: BluetoothDevice | null;
  testWidth: (colunas: number) => Promise<void>;

  // Produtos
  produtos: Produto[];
  setProdutos: (p: Produto[] | ((prev: Produto[]) => Produto[])) => void;

  // Loja
  loja: Loja;
  setLoja: (l: Loja) => Promise<void>;
  setLojaState: (l: Loja) => void;
  setHasLoja: (b: boolean) => void;

  // Historico
  historico: HistoricoPedido[];
  setHistorico: (h: HistoricoPedido[] | ((prev: HistoricoPedido[]) => HistoricoPedido[])) => void;
  reabrirPedido: (pedido: HistoricoPedido) => void;
  pedidoReaberto: HistoricoPedido | null;
  setPedidoReaberto: (p: HistoricoPedido | null) => void;
  
  // Auth & User
  userEmail: string | null;
  setIsAuthenticated: (b: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasLoja, setHasLoja] = useState(false);
  
  const [printer, setPrinter] = useState<BluetoothPrinter | null>(null);
  const [printerName, setPrinterName] = useState<string | null>(null);
  const [printerStatus, setPrinterStatus] = useState<AppState["printerStatus"]>("disconnected");
  const [authorizedDevice, setAuthorizedDevice] = useState<BluetoothDevice | null>(null);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loja, setLojaState] = useState<Loja>(DEFAULT_LOJA);
  const [historico, setHistorico] = useState<HistoricoPedido[]>([]);
  const [pedidoReaberto, setPedidoReaberto] = useState<HistoricoPedido | null>(null);

  useEffect(() => {
    // Sincroniza estado de autenticação via API interna (Proxy)
    // Isso evita que o browser bata direto no Supabase.
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.user) {
          setUserEmail(data.user.email ?? null);
        }
        if (data.loja) {
          setLojaState(data.loja);
          setHasLoja(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Printer ────────────────────────────────────────────────────────────────

  const connectPrinter = async (manualDevice?: BluetoothDevice) => {
    setPrinterStatus("connecting");
    try {
      const p = manualDevice
        ? BluetoothPrinter.linkDevice(manualDevice)
        : await BluetoothPrinter.connect();
      setPrinter(p);
      setPrinterName(p.name);
      setPrinterStatus("connected");
    } catch (e) {
      setPrinterStatus("error");
      throw e;
    }
  };

  const disconnectPrinter = () => {
    setPrinter(null);
    setPrinterName(null);
    setPrinterStatus("disconnected");
  };

  const updatePrinterStatus = () => {
    setPrinterStatus(printer ? "connected" : "disconnected");
  };

  const printCupom = async (pedido: Pedido) => {
    if (!printer) throw new Error("Nenhuma impressora conectada.");

    // 1. Tentar salvar no histórico primeiro (isso valida o limite diário no backend)
    const subtotal = pedido.itens.reduce((s, i) => s + (i.qtd === null ? i.preco_uni : (i.qtd ?? 1) * i.preco_uni), 0);
    let total = subtotal;
    for (const d of pedido.descontos) {
      const abat = d.tipo === "valor" ? d.valor : (total * d.valor) / 100;
      total = Math.max(0, total - abat);
    }

    const novoPedido = await storageAddHist({
      cpf: pedido.cpf || null,
      itens: pedido.itens,
      descontos: pedido.descontos,
      data: new Date().toISOString(),
      total,
    });

    // 2. Se salvou com sucesso, procede com a impressão física
    const lojaParaRender = { ...loja };
    if (loja.logo_raw) {
      lojaParaRender.logo = processLogo(loja.logo_raw, loja.logo_metodo || "dither");
    }
    renderizarCupom(printer, pedido, lojaParaRender);
    await printer.flush();

    // 3. Atualizar estado local
    setHistorico((prev) => [novoPedido, ...prev]);
  };

  const testWidth = async (colunas: number) => {
    if (!printer) throw new Error("Nenhuma impressora conectada.");
    const regua = Array.from({ length: colunas }, (_, i) => (i + 1) % 10).join("");
    printer.set("left");
    printer.text(`--- TESTE ---\nCol: ${colunas}\n${regua}\n\n\n`);
    await printer.flush();
  };

  const reabrirPedido = (pedido: HistoricoPedido) => {
    setPedidoReaberto(pedido);
  };

  const setLoja = async (l: Loja) => {
    await saveLoja(l);
    setLojaState(l);
    setHasLoja(true);
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        hasLoja,
        printer,
        printerName,
        printerStatus,
        authorizedDevice,
        connectPrinter,
        disconnectPrinter,
        updatePrinterStatus,
        printCupom,
        testWidth,
        produtos,
        setProdutos,
        loja,
        setLoja,
        setLojaState,
        setHasLoja,
        historico,
        setHistorico,
        reabrirPedido,
        pedidoReaberto,
        setPedidoReaberto,
        userEmail,
        setIsAuthenticated
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
