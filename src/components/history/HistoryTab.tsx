"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { getHistorico, deleteHistorico as apiDeleteHistorico } from "@/services/api";
import { normalizeHistoricoPedido } from "@/lib/pedidos-normalize";
import type { HistoricoPedido, Pedido } from "@/types";
import {
  History,
  Calendar,
  Trash2,
  ChevronRight,
  Package,
  User,
  Clock,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
  Center,
  IconButton,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { appPanelProps } from "@/theme/layout";

function historicoParaPedido(v: HistoricoPedido): Pedido {
  return {
    cpf: v.cpf,
    itens: v.itens,
    descontos: v.descontos,
    total: v.total,
  };
}

export function HistoryTab() {
  const router = useRouter();
  const {
    isLoading: isAppLoading,
    setPedidoReaberto,
    reimprimirCupom,
    printerStatus,
  } = useApp();
  const [historico, setHistorico] = useState<HistoricoPedido[]>([]);
  const [historicoLoading, setHistoricoLoading] = useState(true);
  const [reprintingId, setReprintingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAppLoading) return;

    let cancelled = false;
    setHistoricoLoading(true);

    getHistorico()
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setHistorico(list.map(normalizeHistoricoPedido));
      })
      .catch((e) => {
        console.error(e);
        toast.error("Não foi possível carregar o histórico");
      })
      .finally(() => {
        if (!cancelled) setHistoricoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAppLoading]);

  const formatDate = (dateStr: string) => {
    if (!mounted) return "…";
    try {
      return format(new Date(dateStr), "dd MMM yyyy", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  const formatTime = (dateStr: string) => {
    if (!mounted) return "…";
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch {
      return "—";
    }
  };

  const handleReabrir = (pedido: HistoricoPedido) => {
    setPedidoReaberto(pedido);
    router.push("/pedido");
  };

  const handleReimprimir = async (venda: HistoricoPedido, e: React.MouseEvent) => {
    e.stopPropagation();
    if (printerStatus !== "connected") {
      toast.error("Conecte a impressora no topo da tela");
      return;
    }
    setReprintingId(venda.id);
    try {
      await reimprimirCupom(historicoParaPedido(venda));
      toast.success("Cupom reimpresso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao reimprimir");
    } finally {
      setReprintingId(null);
    }
  };

  const handleExcluir = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remover esta venda do histórico?")) {
      setDeletingId(id);
      try {
        await apiDeleteHistorico(id);
        setHistorico((prev) => prev.filter((h) => h.id !== id));
        toast.info("Registro removido");
      } catch {
        toast.error("Erro ao remover");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const loading = isAppLoading || historicoLoading;

  if (loading) {
    return (
      <Center py="20">
        <Spinner size="lg" color="blue.400" borderWidth="3px" />
      </Center>
    );
  }

  return (
    <VStack align="stretch" gap={{ base: 4, md: 5 }} w="full" pb={{ base: 1, md: 0 }}>
      <Box {...appPanelProps} overflow="hidden">
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
          justify="space-between"
          gap={4}
          p={{ base: 6, md: 6 }}
        >
          <Flex align="center" gap={3} minW={0}>
            <Center
              w="10"
              h="10"
              rounded="xl"
              bg="blue.500/12"
              color="blue.300"
              flexShrink={0}
            >
              <History size={20} strokeWidth={1.75} />
            </Center>
            <Box minW={0}>
              <Text
                fontSize="11px"
                fontWeight="semibold"
                color="whiteAlpha.500"
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Registros
              </Text>
              <Text fontSize="lg" fontWeight="700" letterSpacing="-0.02em" mt="0.5">
                Histórico de vendas
              </Text>
            </Box>
          </Flex>
          <HStack
            px={4}
            py={2.5}
            rounded="xl"
            bg="whiteAlpha.50"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            justify="center"
            flexShrink={0}
          >
            <Text fontSize="xl" fontWeight="800" color="white" fontVariantNumeric="tabular-nums">
              {historico.length}
            </Text>
            <Text fontSize="11px" fontWeight="600" color="whiteAlpha.500">
              {historico.length === 1 ? "venda" : "vendas"}
            </Text>
          </HStack>
        </Flex>
      </Box>

      <Stack gap={{ base: 3, md: 3 }}>
        {historico.length === 0 ? (
          <Box {...appPanelProps} p={{ base: 6, md: 6 }}>
            <Center
              flexDir="column"
              py={{ base: 12, md: 16 }}
              px={4}
              textAlign="center"
              rounded="xl"
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="whiteAlpha.100"
              bg="whiteAlpha.50"
            >
              <Center
                w="14"
                h="14"
                rounded="full"
                bg="whiteAlpha.80"
                color="whiteAlpha.400"
                mb={4}
              >
                <History size={22} />
              </Center>
              <Text fontWeight="semibold" fontSize="sm">
                Nenhuma venda ainda
              </Text>
              <Text fontSize="13px" color="whiteAlpha.500" mt={2} maxW="280px" lineHeight="short">
                Ao imprimir um cupom na tela de pedido, a venda aparece aqui para consulta ou reabertura.
              </Text>
            </Center>
          </Box>
        ) : (
          historico.map((venda) => (
            <Box
              key={venda.id}
              {...appPanelProps}
              overflow="hidden"
              onClick={() => handleReabrir(venda)}
              role="button"
              tabIndex={0}
              cursor="pointer"
              transition="all 0.15s"
              _hover={{
                borderColor: "blue.400/35",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleReabrir(venda);
                }
              }}
            >
              <Box p={{ base: 6, md: 5 }}>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "stretch", md: "center" }}
                  gap={{ base: 4, md: 5 }}
                >
                  <VStack align="start" gap={1} flexShrink={0} minW={{ md: "140px" }}>
                    <HStack gap={2} color="blue.300">
                      <Calendar size={14} />
                      <Text fontSize="sm" fontWeight="semibold">
                        {formatDate(venda.data)}
                      </Text>
                    </HStack>
                    <HStack gap={2} color="whiteAlpha.500" pl="0.5">
                      <Clock size={12} />
                      <Text fontSize="12px" fontWeight="500">
                        {formatTime(venda.data)}
                      </Text>
                    </HStack>
                  </VStack>

                  <Flex
                    flex="1"
                    direction={{ base: "column", sm: "row" }}
                    align={{ base: "stretch", sm: "center" }}
                    justify="space-between"
                    gap={4}
                    minW={0}
                  >
                    <HStack
                      align="stretch"
                      gap={{ base: 4, sm: 8 }}
                      flexWrap="wrap"
                      flex="1"
                      minW={0}
                    >
                      <HStack gap={2} minW="0">
                        <Center
                          w="8"
                          h="8"
                          rounded="lg"
                          bg="whiteAlpha.50"
                          color="whiteAlpha.500"
                          flexShrink={0}
                        >
                          <Package size={14} />
                        </Center>
                        <VStack align="start" gap={0} minW={0}>
                          <Text fontSize="10px" fontWeight="semibold" color="whiteAlpha.500" textTransform="uppercase">
                            Itens
                          </Text>
                          <Text fontSize="sm" fontWeight="700">
                            {venda.itens.length}
                          </Text>
                        </VStack>
                      </HStack>

                      <HStack gap={2} minW="0" maxW={{ base: "full", sm: "200px" }}>
                        <Center
                          w="8"
                          h="8"
                          rounded="lg"
                          bg="whiteAlpha.50"
                          color="whiteAlpha.500"
                          flexShrink={0}
                        >
                          <User size={14} />
                        </Center>
                        <VStack align="start" gap={0} minW={0}>
                          <Text fontSize="10px" fontWeight="semibold" color="whiteAlpha.500" textTransform="uppercase">
                            Cliente
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" truncate w="full">
                            {venda.cpf ? `CPF ${venda.cpf}` : "Consumidor final"}
                          </Text>
                        </VStack>
                      </HStack>
                    </HStack>

                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      flexShrink={0}
                      w={{ base: "full", md: "auto" }}
                    >
                      <VStack align={{ base: "start", md: "end" }} gap={0}>
                        <Text fontSize="10px" fontWeight="semibold" color="whiteAlpha.500" textTransform="uppercase">
                          Total
                        </Text>
                        <HStack align="baseline" gap={1}>
                          <Text fontSize="sm" fontWeight="700" color="blue.300">
                            R$
                          </Text>
                          <Text
                            fontSize={{ base: "xl", md: "2xl" }}
                            fontWeight="800"
                            fontVariantNumeric="tabular-nums"
                            letterSpacing="-0.02em"
                          >
                            {venda.total.toFixed(2).replace(".", ",")}
                          </Text>
                        </HStack>
                      </VStack>

                      <HStack gap={2} flexShrink={0}>
                        <IconButton
                          variant="subtle"
                          colorPalette="blue"
                          size="sm"
                          rounded="lg"
                          aria-label="Reimprimir cupom"
                          loading={reprintingId === venda.id}
                          disabled={printerStatus !== "connected"}
                          onClick={(e) => handleReimprimir(venda, e)}
                        >
                          <Printer size={16} />
                        </IconButton>
                        <IconButton
                          variant="subtle"
                          colorPalette="red"
                          size="sm"
                          rounded="lg"
                          aria-label="Excluir do histórico"
                          loading={deletingId === venda.id}
                          disabled={deletingId !== null}
                          onClick={(e) => handleExcluir(venda.id, e)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                        <Center
                          w="9"
                          h="9"
                          rounded="lg"
                          bg="whiteAlpha.50"
                          color="whiteAlpha.500"
                          borderWidth="1px"
                          borderColor="whiteAlpha.100"
                        >
                          <ChevronRight size={18} />
                        </Center>
                      </HStack>
                    </Flex>
                  </Flex>
                </Flex>

                <Text fontSize="11px" color="whiteAlpha.400" mt={3} display={{ base: "block", md: "none" }}>
                  Toque para reabrir na comanda
                </Text>
              </Box>
            </Box>
          ))
        )}
      </Stack>
    </VStack>
  );
}
