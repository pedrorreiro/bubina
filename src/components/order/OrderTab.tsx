import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Plus,
  Printer as PrinterIcon,
  GripVertical,
  X,
  Eye,
  Lock,
  Tag,
  RotateCcw,
  User,
} from "lucide-react";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Grid,
  Circle,
  Separator,
  Center,
  Stack,
  Input as ChakraInput,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogRoot,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogContent,
  DialogCloseTrigger,
} from "@/components/ui/dialog";

import type { ItemPedido, Desconto, Pedido, Produto } from "@/types";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { gerarPreview } from "@/services/cupom";
import { LivePreview } from "./LivePreview";
import { maskCPF } from "@/lib/utils";

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.target.select();

/* ═══════════════════════════════════════════════════════════════════════════
   Sortable Item — linha compacta da comanda
   ═══════════════════════════════════════════════════════════════════════════ */

interface SortableItemProps {
  id: string;
  item: ItemPedido;
  sub: number;
  idx: number;
  onUpdateQtd: (idx: number, val: string) => void;
  onUpdatePreco: (idx: number, val: string) => void;
  onRemove: (idx: number) => void;
}

const inputProps = {
  variant: "subtle" as const,
  bg: "whiteAlpha.100",
  borderWidth: "1px",
  borderColor: "whiteAlpha.200",
  borderRadius: "lg",
  fontSize: "13px",
  fontWeight: "500",
  color: "whiteAlpha.950",
  h: "10",
  px: "3",
  _focus: {
    borderColor: "blue.300",
    bg: "whiteAlpha.200",
  },
  _placeholder: { color: "whiteAlpha.500" },
};

function SortableItem({
  id,
  item,
  sub,
  idx,
  onUpdateQtd,
  onUpdatePreco,
  onRemove,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const dragHandle = (
    <Box
      cursor="grab"
      _active={{ cursor: "grabbing" }}
      color="whiteAlpha.300"
      _hover={{ color: "whiteAlpha.600" }}
      flexShrink={0}
      alignSelf={{ base: "flex-start", lg: "center" }}
      mt={{ base: "0.5", lg: 0 }}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={14} />
    </Box>
  );

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      align={{ base: "flex-start", lg: "center" }}
      gap={{ base: 2, lg: 3 }}
      py="3"
      px="4"
      rounded="xl"
      bg={isDragging ? "whiteAlpha.100" : "transparent"}
      borderWidth="1px"
      borderColor={isDragging ? "whiteAlpha.200" : "transparent"}
      opacity={isDragging ? 0.85 : 1}
      zIndex={isDragging ? 1001 : 1}
      _hover={{ bg: "whiteAlpha.50" }}
      transition="background 0.15s"
    >
      {dragHandle}

      {/* Mobile: um bloco só — evita nome duplicado (display em Text às vezes não some no Chakra) */}
      <VStack
        display={{ base: "flex", lg: "none" }}
        flex="1"
        gap={3}
        minW="0"
        w="full"
        align="stretch"
      >
        <Flex align="flex-start" justify="space-between" gap="2" w="full">
          <Text
            flex="1"
            minW="0"
            fontSize="15px"
            fontWeight="600"
            lineHeight="short"
            color="whiteAlpha.900"
            style={{ overflowWrap: "anywhere" }}
          >
            {item.nome}
          </Text>
          <IconButton
            variant="ghost"
            size="sm"
            rounded="lg"
            color="whiteAlpha.400"
            aria-label="Remover"
            flexShrink={0}
            onClick={() => onRemove(idx)}
            _hover={{ color: "red.400", bg: "red.500/10" }}
          >
            <X size={16} />
          </IconButton>
        </Flex>

        <Flex align="center" gap="3" w="full">
          <HStack gap="2" flex="1" minW="0" align="center">
            <ChakraInput
              {...inputProps}
              w="16"
              minW="16"
              textAlign="center"
              fontSize="15px"
              fontWeight="600"
              type="number"
              inputMode="numeric"
              value={item.qtd === 0 || item.qtd === null ? "" : item.qtd}
              onChange={(e) => onUpdateQtd(idx, e.target.value)}
              onFocus={selectOnFocus}
              placeholder="Qtd"
              aria-label="Quantidade"
            />
            <Text fontSize="sm" color="whiteAlpha.400" flexShrink={0}>
              ×
            </Text>
            <Box position="relative" flex="1" minW="0">
              <Text
                position="absolute"
                left="3"
                top="50%"
                transform="translateY(-50%)"
                fontSize="14px"
                fontWeight="600"
                color="whiteAlpha.500"
                pointerEvents="none"
                userSelect="none"
                zIndex={1}
              >
                R$
              </Text>
              <ChakraInput
                {...inputProps}
                w="full"
                pl="10"
                textAlign="right"
                fontSize="15px"
                fontWeight="600"
                type="number"
                inputMode="decimal"
                value={item.preco_uni === 0 ? "" : item.preco_uni}
                onChange={(e) => onUpdatePreco(idx, e.target.value)}
                onFocus={selectOnFocus}
                placeholder="0,00"
                aria-label="Preço unitário"
                step="0.01"
              />
            </Box>
          </HStack>
          <Text
            fontSize="16px"
            fontWeight="800"
            color="white"
            flexShrink={0}
            minW="4.5rem"
            textAlign="right"
            fontVariantNumeric="tabular-nums"
          >
            {sub.toFixed(2).replace(".", ",")}
          </Text>
        </Flex>
      </VStack>

      {/* Desktop: linha compacta */}
      <Flex
        display={{ base: "none", lg: "flex" }}
        flex="1"
        align="center"
        gap="3"
        minW="0"
        w="full"
      >
        <Text flex="1" minW="0" fontSize="13px" fontWeight="500" lineClamp={1}>
          {item.nome}
        </Text>

        <HStack gap="1" flexShrink={0} align="center">
          <ChakraInput
            variant="flushed"
            w="8"
            h="6"
            textAlign="center"
            fontSize="12px"
            fontWeight="600"
            value={item.qtd === 0 || item.qtd === null ? "" : item.qtd}
            onChange={(e) => onUpdateQtd(idx, e.target.value)}
            onFocus={selectOnFocus}
            placeholder="–"
            borderBottomColor="whiteAlpha.100"
            _focus={{ borderBottomColor: "blue.400" }}
            color="whiteAlpha.700"
          />
          <Text fontSize="10px" color="whiteAlpha.300">
            ×
          </Text>
          <Box position="relative" w="16" minW="16" flexShrink={0}>
            <Text
              position="absolute"
              left="0"
              top="50%"
              transform="translateY(-50%)"
              fontSize="11px"
              fontWeight="600"
              color="whiteAlpha.500"
              pointerEvents="none"
              userSelect="none"
              zIndex={1}
              lineHeight="1"
            >
              R$
            </Text>
            <ChakraInput
              variant="flushed"
              w="full"
              pl="6"
              h="6"
              textAlign="right"
              fontSize="12px"
              fontWeight="600"
              value={item.preco_uni === 0 ? "" : item.preco_uni}
              onChange={(e) => onUpdatePreco(idx, e.target.value)}
              onFocus={selectOnFocus}
              placeholder="0.00"
              borderBottomColor="whiteAlpha.100"
              _focus={{ borderBottomColor: "blue.400" }}
              color="whiteAlpha.700"
            />
          </Box>
        </HStack>

        <Text
          fontSize="13px"
          fontWeight="700"
          color="white"
          w="20"
          textAlign="right"
          flexShrink={0}
          fontVariantNumeric="tabular-nums"
        >
          {sub.toFixed(2).replace(".", ",")}
        </Text>

        <IconButton
          variant="ghost"
          size="2xs"
          color="whiteAlpha.200"
          aria-label="Remover"
          onClick={() => onRemove(idx)}
          _hover={{ color: "red.400", bg: "red.500/10" }}
        >
          <X size={14} />
        </IconButton>
      </Flex>
    </Flex>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export function OrderTab() {
  const {
    produtos,
    loja,
    printerStatus,
    savePedido,
    printCupom,
    pedidoReaberto,
    setPedidoReaberto,
  } = useApp();
  const { subscription } = useSubscription();
  const isPremium = subscription?.active;

  const [cpf, setCpf] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [descontos, setDescontos] = useState<Desconto[]>([]);
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPostSaveOpen, setIsPostSaveOpen] = useState(false);
  const [savedPedido, setSavedPedido] = useState<Pedido | null>(null);
  const [printBehavior, setPrintBehavior] = useState<"ask" | "auto">("ask");

  const [avNome, setAvNome] = useState("");
  const [avQtd, setAvQtd] = useState("");
  const [avPreco, setAvPreco] = useState("");

  const [dNome, setDNome] = useState("");
  const [dTipo, setDTipo] = useState<"valor" | "percentual">("valor");
  const [dValor, setDValor] = useState("");

  const [mobileView, setMobileView] = useState<"venda" | "cardapio">("venda");
  const [mounted, setMounted] = useState(false);
  const [stableDate, setStableDate] = useState<Date | undefined>(undefined);
  const PRINT_BEHAVIOR_STORAGE_KEY = "thermal-printer:print-behavior";

  useEffect(() => {
    setMounted(true);
    setStableDate(new Date());
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(PRINT_BEHAVIOR_STORAGE_KEY);
    if (stored === "auto" || stored === "ask") {
      setPrintBehavior(stored);
    }
  }, []);

  const genId = () => Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (pedidoReaberto) {
      setItens(pedidoReaberto.itens);
      setDescontos(pedidoReaberto.descontos);
      setCpf(pedidoReaberto.cpf || "");
      setPedidoReaberto(null);
      toast.success("Pedido reaberto para edição");
    }
  }, [pedidoReaberto, setPedidoReaberto]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const calcSubtotal = (): number =>
    itens.reduce(
      (s, i) => s + (i.qtd === null ? i.preco_uni : (i.qtd ?? 1) * i.preco_uni),
      0,
    );

  const calcTotal = (): number => {
    let t = calcSubtotal();
    for (const d of descontos) {
      const abat = d.tipo === "valor" ? d.valor : (t * d.valor) / 100;
      t = Math.max(0, t - abat);
    }
    return t;
  };

  const buildPedido = (): Pedido => ({
    cpf: cpf.replace(/\D/g, "") || null,
    itens,
    descontos,
    total: calcTotal(),
  });

  const preview = mounted
    ? gerarPreview(buildPedido(), loja, isPremium, stableDate)
    : "";

  const addFromCatalog = (p: Produto) => {
    let aumentouQtd = false;
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.produtoCatalogoId === p.id);
      if (idx >= 0) {
        aumentouQtd = true;
        const cur = prev[idx];
        const base =
          cur.qtd === null || cur.qtd === undefined || Number.isNaN(cur.qtd)
            ? 1
            : cur.qtd;
        const next = [...prev];
        next[idx] = { ...cur, qtd: base + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          nome: p.nome,
          qtd: 1,
          preco_uni: p.preco,
          produtoCatalogoId: p.id,
        },
      ];
    });
    toast.info(aumentouQtd ? `${p.nome} — +1 unidade` : `${p.nome} adicionado`);
  };

  const addManual = () => {
    if (!avNome.trim() || !avPreco) {
      toast.error("Preencha nome e preço");
      return;
    }
    const qtd = avQtd === "" ? null : parseInt(avQtd);
    setItens((prev) => [
      ...prev,
      { id: genId(), nome: avNome, qtd, preco_uni: parseFloat(avPreco) },
    ]);
    setAvNome("");
    setAvQtd("");
    setAvPreco("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItens((items) => {
        const oldIndex = items.findIndex((it) => it.id === active.id);
        const newIndex = items.findIndex((it) => it.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddDesconto = () => {
    const val = parseFloat(dValor);
    if (!dValor || isNaN(val) || val <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setDescontos((prev) => [...prev, { nome: dNome, tipo: dTipo, valor: val }]);
    setDNome("");
    setDValor("");
  };

  const handleImprimirPedido = async (pedido: Pedido) => {
    try {
      if (printerStatus !== "connected") {
        toast.error("Conecte uma impressora");
        return;
      }
      setPrinting(true);
      await printCupom(pedido);
      toast.success("Cupom impresso!");
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : e}`);
    } finally {
      setPrinting(false);
    }
  };

  const handleSalvarPedido = async () => {
    if (itens.length === 0) {
      toast.error("Adicione itens primeiro");
      return;
    }

    const pedido: Pedido = {
      cpf: cpf?.trim() || null,
      itens,
      descontos,
      total: calcTotal(),
    };

    try {
      setSaving(true);
      await savePedido(pedido);
      toast.success("Pedido salvo com sucesso");

      if (printBehavior === "auto") {
        if (printerStatus === "connected") {
          await handleImprimirPedido(pedido);
        } else {
          toast.error("Pedido salvo, mas a impressora está desconectada");
        }
        handleNovoPedido();
        return;
      }

      setSavedPedido(pedido);
      setIsPostSaveOpen(true);
    } catch (e) {
      toast.error(`Erro ao salvar pedido: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNovoPedido = () => {
    setItens([]);
    setDescontos([]);
    setCpf("");
  };

  const handlePrintBehaviorChange = (checked: boolean | "indeterminate") => {
    const nextBehavior = checked === true ? "auto" : "ask";
    setPrintBehavior(nextBehavior);
    window.localStorage.setItem(PRINT_BEHAVIOR_STORAGE_KEY, nextBehavior);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addManual();
  };

  const subtotal = calcSubtotal();
  const total = calcTotal();
  const hasDescontos = descontos.length > 0;
  const panelBg = "#10141d";
  const panelShadow = "0 14px 30px rgba(0, 0, 0, 0.35)";

  /* ── Input shared style ─────────────────────────────────────────────────── */
  const inputStyle = {
    bg: "whiteAlpha.100",
    borderWidth: "1px",
    borderColor: "whiteAlpha.200",
    borderRadius: "lg",
    fontSize: "13px",
    fontWeight: "500",
    color: "whiteAlpha.950",
    _focus: { borderColor: "blue.300", bg: "whiteAlpha.200" },
    _placeholder: { color: "whiteAlpha.500" },
    transition: "all 0.15s",
  } as const;

  return (
    <Flex
      direction="column"
      h="full"
      maxH={{ lg: "calc(100dvh - 7.5rem)" }}
      overflow={{ lg: "hidden" }}
    >
      {/* ── Mobile tab bar ────────────────────────────────────────────────── */}
      <HStack
        display={{ base: "flex", lg: "none" }}
        bg={panelBg}
        p="1"
        rounded="lg"
        gap="1"
        mb="4"
        boxShadow={panelShadow}
      >
        {[
          { key: "venda" as const, label: "Comanda", count: itens.length },
          { key: "cardapio" as const, label: "Adicionar", count: 0 },
        ].map((t) => (
          <Button
            key={t.key}
            flex="1"
            h="10"
            rounded="md"
            variant={mobileView === t.key ? "solid" : "ghost"}
            colorPalette={mobileView === t.key ? "blue" : undefined}
            fontSize="13px"
            fontWeight="600"
            onClick={() => setMobileView(t.key)}
          >
            {t.label}
            {t.count > 0 && (
              <Box
                ml="1.5"
                px="1.5"
                rounded="full"
                bg="whiteAlpha.200"
                fontSize="11px"
                fontWeight="700"
                lineHeight="1.6"
              >
                {t.count}
              </Box>
            )}
          </Button>
        ))}
      </HStack>

      {/* ── Two-column grid ───────────────────────────────────────────────── */}
      <Grid
        templateColumns={{ base: "1fr", lg: "380px 1fr" }}
        gap={{ base: "0", lg: "6" }}
        flex="1"
        minH="0"
        overflow="hidden"
      >
        {/* ════════════════════════════════════════════════════════════════
           LEFT — Comanda (ticket / receipt builder)
           ════════════════════════════════════════════════════════════════ */}
        <Flex
          direction="column"
          display={{
            base: mobileView === "venda" ? "flex" : "none",
            lg: "flex",
          }}
          bg={panelBg}
          rounded={{ base: "xl", lg: "2xl" }}
          borderWidth="0"
          boxShadow={panelShadow}
          overflow="hidden"
          maxH={{ lg: "100%" }}
        >
          {/* Header */}
          <Flex
            align="center"
            justify="space-between"
            px="5"
            py="4"
            flexShrink={0}
          >
            <HStack gap="2">
              <Text fontSize="15px" fontWeight="700" letterSpacing="-0.02em">
                Comanda
              </Text>
              {itens.length > 0 && (
                <Box
                  px="2"
                  py="0.5"
                  rounded="md"
                  bg="blue.500/15"
                  fontSize="11px"
                  fontWeight="700"
                  color="blue.300"
                >
                  {itens.length} {itens.length === 1 ? "item" : "itens"}
                </Box>
              )}
            </HStack>
            <HStack gap="1">
              <IconButton
                variant="ghost"
                size="sm"
                rounded="lg"
                color="whiteAlpha.700"
                onClick={() => setIsPreviewOpen(true)}
                aria-label="Preview"
              >
                <Eye size={16} />
              </IconButton>
            </HStack>
          </Flex>

          {/* CPF inline */}
          <Flex px="5" pb="3" gap="2" align="center" flexShrink={0}>
            <User size={13} color="var(--color-text-dim)" />
            <ChakraInput
              variant="flushed"
              flex="1"
              fontSize="13px"
              fontWeight="500"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="CPF (opcional)"
              borderBottomColor="whiteAlpha.100"
              _focus={{ borderBottomColor: "blue.400" }}
              _placeholder={{ color: "whiteAlpha.500" }}
            />
          </Flex>

          <Separator borderColor="whiteAlpha.200" />

          {/* Item list */}
          <Box
            flex="1"
            overflowY="auto"
            minH="0"
            py="1"
            pb={{ base: 4, md: 1 }}
          >
            {itens.length === 0 ? (
              <Center flexDir="column" py="16" opacity={0.4}>
                <Text fontSize="13px" fontWeight="500" color="whiteAlpha.700">
                  Comanda vazia
                </Text>
              </Center>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={itens.map((it) => it.id!)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack gap="0">
                    {itens.map((item, idx) => {
                      const itemSub =
                        item.qtd === null
                          ? item.preco_uni
                          : (item.qtd ?? 1) * item.preco_uni;
                      return (
                        <SortableItem
                          key={item.id}
                          id={item.id!}
                          item={item}
                          sub={itemSub}
                          idx={idx}
                          onUpdateQtd={(i, v) =>
                            setItens((p) =>
                              p.map((it, x) =>
                                x === i
                                  ? {
                                      ...it,
                                      qtd: v === "" ? null : parseInt(v),
                                    }
                                  : it,
                              ),
                            )
                          }
                          onUpdatePreco={(i, v) =>
                            setItens((p) =>
                              p.map((it, x) =>
                                x === i
                                  ? {
                                      ...it,
                                      preco_uni: v === "" ? 0 : parseFloat(v),
                                    }
                                  : it,
                              ),
                            )
                          }
                          onRemove={(i) =>
                            setItens((p) => p.filter((_, x) => x !== i))
                          }
                        />
                      );
                    })}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Box>

          <Separator borderColor="whiteAlpha.200" />

          {/* Footer — totals + CTA */}
          <Box px="5" py="4" flexShrink={0}>
            <VStack gap="3" align="stretch">
              {/* Subtotal */}
              <Flex
                justify="space-between"
                fontSize="13px"
                color="whiteAlpha.800"
              >
                <Text>Subtotal</Text>
                <Text
                  fontWeight="600"
                  fontVariantNumeric="tabular-nums"
                  color="whiteAlpha.900"
                >
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </Text>
              </Flex>

              {/* Descontos */}
              {hasDescontos &&
                descontos.map((d, i) => (
                  <Flex
                    key={i}
                    justify="space-between"
                    align="center"
                    fontSize="12px"
                    color="red.300"
                  >
                    <HStack gap="1.5" minW="0">
                      <Tag size={10} />
                      <Text truncate>{d.nome || "Desconto"}</Text>
                    </HStack>
                    <HStack gap="1.5" flexShrink={0}>
                      <Text fontVariantNumeric="tabular-nums">
                        −
                        {d.tipo === "valor"
                          ? ` R$ ${d.valor.toFixed(2).replace(".", ",")}`
                          : ` ${d.valor}%`}
                      </Text>
                      <IconButton
                        variant="plain"
                        size="2xs"
                        color="red.300"
                        aria-label="Remover"
                        onClick={() =>
                          setDescontos((p) => p.filter((_, x) => x !== i))
                        }
                      >
                        <X size={11} />
                      </IconButton>
                    </HStack>
                  </Flex>
                ))}

              {/* Total */}
              <Flex justify="space-between" align="baseline" pt="1">
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  color="whiteAlpha.800"
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                >
                  Total
                </Text>
                <HStack align="baseline" gap="1">
                  <Text fontSize="13px" fontWeight="600" color="blue.300">
                    R$
                  </Text>
                  <Text
                    fontSize="28px"
                    fontWeight="800"
                    color="white"
                    lineHeight="1"
                    fontVariantNumeric="tabular-nums"
                    letterSpacing="-0.03em"
                  >
                    {total.toFixed(2).replace(".", ",")}
                  </Text>
                </HStack>
              </Flex>

              {/* Action button */}
              <Button
                w="full"
                h="12"
                rounded="xl"
                colorPalette="blue"
                fontWeight="700"
                disabled={saving || printing || itens.length === 0}
                onClick={handleSalvarPedido}
                loading={saving}
              >
                <RotateCcw size={18} />
                <Text ml="2">Concluir venda</Text>
              </Button>

              <Checkbox
                checked={printBehavior === "auto"}
                onCheckedChange={(e) => handlePrintBehaviorChange(e.checked)}
                css={{
                  "& [data-part='control']": {
                    bg: "whiteAlpha.100",
                    borderColor: "whiteAlpha.200",
                  },
                  "& [data-part='control'][data-state='checked']": {
                    bg: "blue.500",
                    borderColor: "blue.500",
                  },
                }}
              >
                <Text fontSize="12px" color="whiteAlpha.700">
                  Imprimir automaticamente ao salvar
                </Text>
              </Checkbox>

              {printerStatus !== "connected" && (
                <HStack justify="center" gap="2" py="1">
                  <Circle size="1.5" bg="red.400" />
                  <Text fontSize="11px" color="whiteAlpha.600">
                    Impressora desconectada
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        </Flex>

        {/* ════════════════════════════════════════════════════════════════
           RIGHT — Adicionar itens / catálogo
           ════════════════════════════════════════════════════════════════ */}
        <Flex
          direction="column"
          display={{
            base: mobileView === "cardapio" ? "flex" : "none",
            lg: "flex",
          }}
          gap="5"
          overflow="hidden"
          minH="0"
        >
          {/* ── Add manual item ───────────────────────────────────────── */}
          <Box
            bg={panelBg}
            rounded={{ base: "xl", lg: "2xl" }}
            borderWidth="0"
            boxShadow={panelShadow}
            px={{ base: 6, md: 5 }}
            py={{ base: 6, md: 5 }}
            flexShrink={0}
          >
            <Text
              fontSize="12px"
              fontWeight="600"
              color="whiteAlpha.800"
              textTransform="uppercase"
              letterSpacing="0.06em"
              mb="3"
            >
              Item avulso
            </Text>
            <Flex gap="3" direction={{ base: "column", md: "row" }}>
              <ChakraInput
                {...inputProps}
                placeholder="Nome do item"
                value={avNome}
                onChange={(e) => setAvNome(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={24}
              />
              <Flex
                gap="2"
                flexShrink={0}
                direction={{ base: "row", md: "row" }}
                flexWrap={{ base: "wrap", md: "nowrap" }}
                align={{ base: "stretch", md: "center" }}
                w={{ base: "full", md: "auto" }}
              >
                <ChakraInput
                  {...inputProps}
                  flex={{ base: "1 1 72px", md: "none" }}
                  w={{ base: "auto", md: "16" }}
                  minW={{ base: "72px", md: "unset" }}
                  textAlign="center"
                  type="number"
                  placeholder="Qtd"
                  value={avQtd}
                  onChange={(e) => setAvQtd(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={selectOnFocus}
                />
                <ChakraInput
                  {...inputProps}
                  flex={{ base: "1 1 100px", md: "none" }}
                  w={{ base: "auto", md: "24" }}
                  minW={{ base: "100px", md: "unset" }}
                  textAlign="right"
                  type="number"
                  placeholder="R$ 0,00"
                  value={avPreco}
                  onChange={(e) => setAvPreco(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={selectOnFocus}
                  step="0.01"
                />
                <IconButton
                  colorPalette="blue"
                  h="10"
                  w="10"
                  rounded="lg"
                  flexShrink={0}
                  onClick={addManual}
                  aria-label="Adicionar"
                >
                  <Plus size={18} />
                </IconButton>
              </Flex>
            </Flex>
          </Box>

          {/* ── Discount ──────────────────────────────────────────────── */}
          <Box
            bg={panelBg}
            rounded={{ base: "xl", lg: "2xl" }}
            borderWidth="0"
            boxShadow={panelShadow}
            px={{ base: 6, md: 5 }}
            py={{ base: 6, md: 5 }}
            flexShrink={0}
          >
            <Text
              fontSize="12px"
              fontWeight="600"
              color="whiteAlpha.800"
              textTransform="uppercase"
              letterSpacing="0.06em"
              mb="3"
            >
              Desconto
            </Text>
            <Flex gap="3" direction={{ base: "column", md: "row" }}>
              <ChakraInput
                {...inputProps}
                placeholder="Referência (ex: PIX)"
                value={dNome}
                onChange={(e) => setDNome(e.target.value)}
              />
              <Flex
                gap="2"
                flexShrink={0}
                flexWrap={{ base: "wrap", md: "nowrap" }}
                align={{ base: "center", md: "center" }}
                w={{ base: "full", md: "auto" }}
              >
                <HStack
                  bg="whiteAlpha.100"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  rounded="lg"
                  p="0.5"
                  gap="0.5"
                  h="10"
                  flexShrink={0}
                >
                  <Button
                    variant={dTipo === "valor" ? "solid" : "ghost"}
                    colorPalette={dTipo === "valor" ? "blue" : undefined}
                    size="sm"
                    h="9"
                    px="3"
                    rounded="md"
                    fontSize="12px"
                    fontWeight="700"
                    onClick={() => setDTipo("valor")}
                  >
                    R$
                  </Button>
                  <Button
                    variant={dTipo === "percentual" ? "solid" : "ghost"}
                    colorPalette={dTipo === "percentual" ? "blue" : undefined}
                    size="sm"
                    h="9"
                    px="3"
                    rounded="md"
                    fontSize="12px"
                    fontWeight="700"
                    onClick={() => setDTipo("percentual")}
                  >
                    %
                  </Button>
                </HStack>
                <ChakraInput
                  {...inputStyle}
                  flex={{ base: "1 1 100px", md: "none" }}
                  w={{ base: "auto", md: "24" }}
                  minW={{ base: "100px", md: "unset" }}
                  px="3"
                  h="10"
                  textAlign="right"
                  type="number"
                  placeholder="0,00"
                  value={dValor}
                  onChange={(e) => setDValor(e.target.value)}
                />
                <IconButton
                  colorPalette="blue"
                  h="10"
                  w="10"
                  rounded="lg"
                  flexShrink={0}
                  onClick={handleAddDesconto}
                  disabled={!dValor}
                  aria-label="Adicionar desconto"
                >
                  <Plus size={18} />
                </IconButton>
              </Flex>
            </Flex>
          </Box>

          {/* ── Catalog ───────────────────────────────────────────────── */}
          <Box
            flex="1"
            minH="0"
            bg={panelBg}
            rounded={{ base: "xl", lg: "2xl" }}
            borderWidth="0"
            boxShadow={panelShadow}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Flex
              align="center"
              justify="space-between"
              px={{ base: 6, md: 5 }}
              py="4"
              flexShrink={0}
            >
              <Text
                fontSize="12px"
                fontWeight="600"
                color="whiteAlpha.800"
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Catálogo
              </Text>
              {isPremium && produtos.length > 0 && (
                <Text fontSize="11px" color="whiteAlpha.700">
                  {produtos.length}{" "}
                  {produtos.length === 1 ? "produto" : "produtos"}
                </Text>
              )}
            </Flex>

            <Box
              flex="1"
              overflowY="auto"
              px={{ base: 6, md: 5 }}
              pb={{ base: 10, md: 5 }}
              minH="0"
            >
              {!isPremium ? (
                <Center
                  flexDir="column"
                  py="12"
                  textAlign="center"
                  gap="3"
                  rounded="xl"
                  bg="whiteAlpha.50"
                  borderWidth="1px"
                  borderStyle="dashed"
                  borderColor="whiteAlpha.300"
                >
                  <Circle size="12" bg="blue.500/10" color="blue.300">
                    <Lock size={20} />
                  </Circle>
                  <Box>
                    <Text fontWeight="600" fontSize="14px" mb="1">
                      Catálogo Premium
                    </Text>
                    <Text fontSize="12px" color="whiteAlpha.700" maxW="240px">
                      Salve seus produtos e venda com um toque.
                    </Text>
                  </Box>
                  <Button
                    asChild
                    colorPalette="blue"
                    size="sm"
                    rounded="lg"
                    fontWeight="600"
                    mt="1"
                  >
                    <a href="/paywall">Ver Planos</a>
                  </Button>
                </Center>
              ) : produtos.length === 0 ? (
                <Center flexDir="column" py="12" opacity={0.4}>
                  <Text fontSize="13px" color="whiteAlpha.700">
                    Nenhum produto cadastrado
                  </Text>
                  <Text fontSize="11px" color="whiteAlpha.600" mt="1">
                    Vá em Produtos para adicionar.
                  </Text>
                </Center>
              ) : (
                <Grid
                  templateColumns="repeat(auto-fill, minmax(140px, 1fr))"
                  gap="3"
                >
                  {produtos.map((p) => (
                    <Flex
                      key={p.id}
                      direction="column"
                      justify="space-between"
                      role="button"
                      tabIndex={0}
                      cursor="pointer"
                      p="4"
                      minH="88px"
                      bg="whiteAlpha.100"
                      borderWidth="1px"
                      borderColor="whiteAlpha.200"
                      rounded="xl"
                      transition="all 0.15s"
                      _hover={{
                        bg: "blue.500/10",
                        borderColor: "blue.400/30",
                        transform: "translateY(-2px)",
                      }}
                      _active={{ transform: "scale(0.97)" }}
                      onClick={() => addFromCatalog(p)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          addFromCatalog(p);
                        }
                      }}
                    >
                      <Text
                        fontSize="13px"
                        fontWeight="600"
                        lineClamp={2}
                        mb="2"
                      >
                        {p.nome}
                      </Text>
                      <Text
                        fontSize="15px"
                        fontWeight="800"
                        color="blue.300"
                        fontVariantNumeric="tabular-nums"
                      >
                        {p.preco.toFixed(2).replace(".", ",")}
                      </Text>
                    </Flex>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        </Flex>
      </Grid>

      {/* ── Preview Modal ─────────────────────────────────────────────── */}
      <DialogRoot
        open={isPreviewOpen}
        onOpenChange={(e) => setIsPreviewOpen(e.open)}
        size="md"
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <DialogContent
          bg={panelBg}
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          rounded="2xl"
          p="0"
          overflow="hidden"
          w={{ base: "full", md: "auto" }}
          maxW={{ base: "min(calc(100vw - 2rem), 32rem)", md: "lg" }}
          mx="auto"
          my={{ base: 4, md: "auto" }}
        >
          <DialogHeader
            px={{ base: 5, md: 5 }}
            py="4"
            pr={{ base: 12, md: 10 }}
          >
            <Flex justify="space-between" align="center" w="full">
              <DialogTitle fontSize="14px" fontWeight="700">
                Pré-visualização
              </DialogTitle>
              <DialogCloseTrigger>
                <X size={16} />
              </DialogCloseTrigger>
            </Flex>
          </DialogHeader>
          <DialogBody px={{ base: 4, md: 5 }} pb="5">
            <Box
              bg="#fafafa"
              rounded="lg"
              maxH="55vh"
              overflowY="auto"
              mx="auto"
              w="fit-content"
              maxW="full"
            >
              <LivePreview content={preview} colunas={loja.largura_colunas} />
            </Box>
          </DialogBody>
          <DialogFooter
            px={{ base: 5, md: 5 }}
            py="4"
            borderTopWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <Button
              w="full"
              colorPalette="blue"
              h="11"
              rounded="lg"
              fontWeight="700"
              onClick={() => {
                handleImprimirPedido(buildPedido());
                setIsPreviewOpen(false);
              }}
              disabled={printing || printerStatus !== "connected"}
              loading={printing}
            >
              <PrinterIcon size={16} />
              <Text ml="2">Imprimir agora</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* ── Pós-salvamento ─────────────────────────────────────────────── */}
      <DialogRoot
        open={isPostSaveOpen}
        onOpenChange={(e) => {
          setIsPostSaveOpen(e.open);
          if (!e.open) {
            setSavedPedido(null);
            handleNovoPedido();
          }
        }}
        size="sm"
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <DialogContent
          bg={panelBg}
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          rounded="2xl"
          p="0"
          overflow="hidden"
        >
          <DialogHeader px="5" py="4" pr="10">
            <Flex justify="space-between" align="center" w="full">
              <DialogTitle fontSize="14px" fontWeight="700">
                Pedido salvo
              </DialogTitle>
              <DialogCloseTrigger>
                <X size={16} />
              </DialogCloseTrigger>
            </Flex>
          </DialogHeader>
          <DialogBody px="5" pb="5">
            <Text fontSize="13px" color="whiteAlpha.700">
              Deseja imprimir este pedido agora?
            </Text>
          </DialogBody>
          <DialogFooter
            px="5"
            py="4"
            borderTopWidth="1px"
            borderColor="whiteAlpha.200"
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap="2"
          >
            <Button
              variant="outline"
              h="11"
              rounded="lg"
              onClick={() => {
                setIsPostSaveOpen(false);
                setSavedPedido(null);
                handleNovoPedido();
                toast.success("Pedido concluído sem impressão.");
              }}
            >
              Agora não
            </Button>
            <Button
              colorPalette="blue"
              h="11"
              rounded="lg"
              disabled={
                printing || printerStatus !== "connected" || savedPedido === null
              }
              loading={printing}
              onClick={async () => {
                if (!savedPedido) return;
                await handleImprimirPedido(savedPedido);
                setIsPostSaveOpen(false);
                setSavedPedido(null);
                handleNovoPedido();
              }}
            >
              <PrinterIcon size={16} />
              <Text ml="2">Imprimir agora</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Flex>
  );
}
