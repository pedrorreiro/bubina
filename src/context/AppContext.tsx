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
  HistoricoPedido,
  SubscriptionStatus,
} from "../types";
import { BluetoothPrinter } from "../services/bluetooth";
import { renderizarCupom } from "../services/cupom";
import { fetchAndProcessLogo } from "../services/image";
import { DEFAULT_LOJA } from "../types";
import {
  addToHistorico as storageAddHist,
  saveLoja as storageSaveLoja,
} from "../services/api";

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
  savePedido: (pedido: Pedido) => Promise<void>;
  printCupom: (pedido: Pedido) => Promise<void>;
  /** Só envia à impressora (pedido já existe no histórico). */
  reimprimirCupom: (pedido: Pedido) => Promise<void>;
  authorizedDevice: BluetoothDevice | null;
  testWidth: (colunas: number) => Promise<void>;

  // Produtos
  produtos: Produto[];
  setProdutos: (p: Produto[] | ((prev: Produto[]) => Produto[])) => void;

  // Loja
  loja: Loja;
  setLoja: (l: Loja) => Promise<void>;
  updateLojaLocally: (l: Loja) => void;
  setLojaState: (l: Loja) => void;
  setHasLoja: (b: boolean) => void;

  /** Pedido vindo do histórico para editar na tela de pedido */
  pedidoReaberto: HistoricoPedido | null;
  setPedidoReaberto: (p: HistoricoPedido | null) => void;

  // Auth, User & Subscription
  userId: string | null;
  userEmail: string | null;
  setIsAuthenticated: (b: boolean) => void;
  subscription: SubscriptionStatus | null;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [hasLoja, setHasLoja] = useState(false);

  const [printer, setPrinter] = useState<BluetoothPrinter | null>(null);
  const [printerName, setPrinterName] = useState<string | null>(null);
  const [printerStatus, setPrinterStatus] =
    useState<AppState["printerStatus"]>("disconnected");
  const [authorizedDevice, setAuthorizedDevice] =
    useState<BluetoothDevice | null>(null);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loja, setLojaState] = useState<Loja>(DEFAULT_LOJA);
  const [pedidoReaberto, setPedidoReaberto] = useState<HistoricoPedido | null>(
    null,
  );

  useEffect(() => {
    // Sincroniza estado de autenticação via API interna (Proxy)
    // Isso evita que o browser bata direto no Supabase.
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          setUserId(null);
          setUserEmail(null);
        }
        if (data.user) {
          setUserId(data.user.id ?? null);
          setUserEmail(data.user.email ?? null);
        }
        if (data.loja) {
          setLojaState(data.loja);
          setHasLoja(true);
        }
        if (data.subscription) {
          setSubscription(data.subscription);
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
      if (manualDevice) {
        setAuthorizedDevice(manualDevice);
      } else {
        try {
          const devices = await BluetoothPrinter.getAuthorizedDevices();
          setAuthorizedDevice(devices[0] ?? null);
        } catch {
          setAuthorizedDevice(null);
        }
      }
    } catch (e) {
      setPrinterStatus("error");
      throw e;
    }
  };

  const disconnectPrinter = () => {
    setPrinter(null);
    setPrinterName(null);
    setPrinterStatus("disconnected");
    setAuthorizedDevice(null);
  };

  const updatePrinterStatus = () => {
    setPrinterStatus(printer ? "connected" : "disconnected");
  };

  const buildLojaParaImpressao = async (): Promise<Loja> => {
    const lojaParaRender = { ...loja };

    if (subscription?.active) {
      if (loja.logo_url) {
        try {
          lojaParaRender.logo = await fetchAndProcessLogo(
            loja.logo_url,
            loja.logo_metodo || "dither",
          );
          delete lojaParaRender.logo_url;
        } catch (e) {
          console.error("Falha ao processar logo via URL para impressão:", e);
          delete lojaParaRender.logo_url;
        }
      }
    } else {
      delete lojaParaRender.logo;
      delete lojaParaRender.logo_url;
    }

    return lojaParaRender;
  };

  const imprimirPedidoFisico = async (pedido: Pedido) => {
    const p = printer;
    if (!p) throw new Error("Nenhuma impressora conectada.");
    const lojaParaRender = await buildLojaParaImpressao();
    renderizarCupom(p, pedido, lojaParaRender);
    await p.flush();
  };

  const reimprimirCupom = async (pedido: Pedido) => {
    await imprimirPedidoFisico(pedido);
  };

  const calcularTotalPedido = (pedido: Pedido) => {
    const subtotal = pedido.itens.reduce(
      (s, i) => s + (i.qtd === null ? i.preco_uni : (i.qtd ?? 1) * i.preco_uni),
      0,
    );
    let total = subtotal;
    for (const d of pedido.descontos) {
      const abat = d.tipo === "valor" ? d.valor : (total * d.valor) / 100;
      total = Math.max(0, total - abat);
    }
    return total;
  };

  const savePedido = async (pedido: Pedido) => {
    const total = calcularTotalPedido(pedido);
    await storageAddHist({
      cpf: pedido.cpf || null,
      itens: pedido.itens,
      descontos: pedido.descontos,
      data: new Date().toISOString(),
      total,
    });
  };

  const printCupom = async (pedido: Pedido) => {
    if (!printer) throw new Error("Nenhuma impressora conectada.");

    try {
      await imprimirPedidoFisico(pedido);
    } catch (e) {
      console.error("Falha na impressão após salvar:", e);
      throw new Error("A impressão falhou. Tente novamente.");
    }
  };

  const testWidth = async (colunas: number) => {
    if (!printer) throw new Error("Nenhuma impressora conectada.");
    const regua = Array.from({ length: colunas }, (_, i) => (i + 1) % 10).join(
      "",
    );
    printer.set("left");
    printer.text(`--- TESTE ---\nCol: ${colunas}\n${regua}\n\n\n`);
    await printer.flush();
  };

  const updateLojaLocally = (l: Loja) => {
    setLojaState(l);
  };

  const saveLojaToDatabase = async (l: Loja) => {
    await storageSaveLoja(l);
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
        savePedido,
        printCupom,
        reimprimirCupom,
        testWidth,
        produtos,
        setProdutos,
        loja,
        setLoja: saveLojaToDatabase,
        updateLojaLocally,
        setLojaState,
        setHasLoja,
        pedidoReaberto,
        setPedidoReaberto,
        userEmail,
        userId,
        setIsAuthenticated,
        subscription,
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
