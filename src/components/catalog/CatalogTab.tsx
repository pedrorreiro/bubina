"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/useCatalog";
import { useSubscription } from "@/hooks/useSubscription";
import { PlusCircle, LayoutList, Lock, X, Package } from "lucide-react";
import type { Produto } from "@/types";
import {
  Box,
  Flex,
  Grid,
  Text,
  HStack,
  VStack,
  IconButton,
  Center,
  Input as ChakraInput,
  Spinner,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: typeof PlusCircle;
  eyebrow: string;
  title: string;
}) {
  return (
    <Flex
      align="center"
      gap="3"
      pb="4"
      mb="1"
      borderBottomWidth="1px"
      borderColor="var(--color-edge)"
    >
      <Center
        w="10"
        h="10"
        rounded="xl"
        bg="blue.500/12"
        color="blue.300"
        flexShrink={0}
      >
        <Icon size={20} strokeWidth={1.75} />
      </Center>
      <Box minW="0">
        <Text
          fontSize="11px"
          fontWeight="semibold"
          color="whiteAlpha.500"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {eyebrow}
        </Text>
        <Text fontSize="lg" fontWeight="700" letterSpacing="-0.02em" mt="0.5">
          {title}
        </Text>
      </Box>
    </Flex>
  );
}

const inputProps = {
  variant: "subtle" as const,
  bg: "whiteAlpha.50",
  borderWidth: "1px",
  borderColor: "whiteAlpha.100",
  borderRadius: "lg",
  fontSize: "13px",
  fontWeight: "500",
  h: "10",
  px: "3",
  _focus: {
    borderColor: "blue.400/55",
    bg: "whiteAlpha.80",
  },
  _placeholder: { color: "whiteAlpha.300" },
};

export function CatalogTab() {
  const { produtos, isLoading: isAppLoading } = useApp();
  const { addProduto, deleteProduto } = useCatalog();
  const { subscription, isLoading: isSubLoading } = useSubscription();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = isAppLoading || isSubLoading;
  const isPremium = subscription?.active;

  if (isLoading) {
    return (
      <Center py="20">
        <Spinner size="lg" color="blue.400" borderWidth="3px" />
      </Center>
    );
  }

  const salvar = async () => {
    const p = parseFloat(preco);
    if (!nome.trim() || isNaN(p)) {
      toast.error("Preencha nome e preço corretamente");
      return;
    }
    setIsSaving(true);
    try {
      await addProduto(nome.trim(), p);
      setNome("");
      setPreco("");
      toast.success("Produto adicionado ao catálogo");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack align="stretch" gap={{ base: 4, md: 5 }} w="full" pb={{ base: 2, md: 0 }}>
      <Grid
        templateColumns={
          isPremium ? { base: "1fr", lg: "minmax(280px, 320px) 1fr" } : "1fr"
        }
        gap={{ base: 4, md: 5, lg: 6 }}
        alignItems="start"
      >
        {isPremium ? (
          <Box
            position={{ base: "static", lg: "sticky" }}
            top={{ lg: 6 }}
            w="full"
            className="app-panel"
            overflow="hidden"
          >
            <Box p={{ base: 5, md: 6 }}>
              <SectionHeader
                icon={PlusCircle}
                eyebrow="Cadastro"
                title="Novo produto"
              />
              <VStack gap={4} align="stretch" pt={5}>
                <Field label="Nome">
                  <ChakraInput
                    {...inputProps}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    maxLength={24}
                    placeholder="Ex.: Coca-Cola 350ml"
                  />
                </Field>
                <Field label="Preço">
                  <HStack
                    bg="whiteAlpha.50"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                    borderRadius="lg"
                    overflow="hidden"
                    h="10"
                    transition="all 0.15s"
                    _focusWithin={{
                      borderColor: "blue.400/55",
                      bg: "whiteAlpha.80",
                    }}
                  >
                    <Center
                      px="3"
                      borderRightWidth="1px"
                      borderColor="whiteAlpha.100"
                      bg="whiteAlpha.50"
                      h="full"
                      flexShrink={0}
                    >
                      <Text fontSize="12px" fontWeight="700" color="blue.300">
                        R$
                      </Text>
                    </Center>
                    <ChakraInput
                      flex="1"
                      variant="subtle"
                      border="none"
                      borderRadius="0"
                      fontSize="13px"
                      fontWeight="600"
                      type="number"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      placeholder="0,00"
                      step="0.01"
                      px="3"
                      h="full"
                      minH="10"
                      fontVariantNumeric="tabular-nums"
                    />
                  </HStack>
                </Field>
                <Button
                  colorPalette="blue"
                  h="11"
                  rounded="xl"
                  fontWeight="700"
                  fontSize="sm"
                  onClick={salvar}
                  loading={isSaving}
                >
                  Adicionar ao catálogo
                </Button>
              </VStack>
            </Box>
          </Box>
        ) : (
          <Link href="/paywall" style={{ textDecoration: "none", width: "100%" }}>
            <Box
              className="app-panel"
              p={{ base: 5, md: 6 }}
              transition="all 0.2s"
              cursor="pointer"
              _hover={{ borderColor: "blue.400/25" }}
            >
              <Flex
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                gap={{ base: 4, sm: 5 }}
              >
                <Center
                  w="12"
                  h="12"
                  rounded="xl"
                  bg="blue.500/12"
                  color="blue.300"
                  flexShrink={0}
                >
                  <Lock size={22} />
                </Center>
                <Box flex="1" minW={0}>
                  <Text fontSize="lg" fontWeight="700" letterSpacing="-0.02em">
                    Catálogo no Pro
                  </Text>
                  <Text fontSize="13px" color="whiteAlpha.500" mt={1} lineHeight="short">
                    Cadastre produtos e lance na comanda com um toque. Plano Premium.
                  </Text>
                  <Button colorPalette="blue" size="sm" rounded="lg" fontWeight="600" mt={4}>
                    Ver planos
                  </Button>
                </Box>
              </Flex>
            </Box>
          </Link>
        )}

        <Box className="app-panel" overflow="hidden" display="flex" flexDirection="column" minW={0}>
          <Box p={{ base: 5, md: 6 }} flexShrink={0}>
            <Flex
              align="flex-start"
              justify="space-between"
              gap={3}
              pb="4"
              mb="1"
              borderBottomWidth="1px"
              borderColor="var(--color-edge)"
            >
              <Flex align="center" gap="3" minW={0}>
                <Center
                  w="10"
                  h="10"
                  rounded="xl"
                  bg="whiteAlpha.50"
                  color="whiteAlpha.500"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  flexShrink={0}
                >
                  <LayoutList size={20} strokeWidth={1.75} />
                </Center>
                <Box minW={0}>
                  <Text
                    fontSize="11px"
                    fontWeight="semibold"
                    color="whiteAlpha.500"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    Lista
                  </Text>
                  <Text fontSize="lg" fontWeight="700" letterSpacing="-0.02em" mt="0.5">
                    Seus produtos
                  </Text>
                </Box>
              </Flex>
              <Box
                px="3"
                py="1.5"
                rounded="lg"
                bg="whiteAlpha.50"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
                flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="700" color="white" textAlign="center">
                  {produtos.length}
                </Text>
                <Text fontSize="10px" color="whiteAlpha.500" textAlign="center" lineHeight="1.2">
                  {produtos.length === 1 ? "item" : "itens"}
                </Text>
              </Box>
            </Flex>
          </Box>

          <Box px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }} pt={0}>
            {produtos.length === 0 ? (
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
                  <Package size={22} />
                </Center>
                <Text fontWeight="semibold" fontSize="sm">
                  Nenhum produto ainda
                </Text>
                <Text fontSize="13px" color="whiteAlpha.500" mt={2} maxW="260px" lineHeight="short">
                  {isPremium
                    ? "Use o formulário ao lado para incluir o primeiro item."
                    : "Assine o Pro para cadastrar e ver sua lista aqui."}
                </Text>
              </Center>
            ) : (
              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: isPremium ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fill, minmax(200px, 1fr))",
                }}
                gap={{ base: 3, md: 3 }}
              >
                {produtos.map((p: Produto) => (
                  <Flex
                    key={p.id}
                    align="center"
                    justify="space-between"
                    gap={3}
                    p={{ base: 4, md: 4 }}
                    rounded="xl"
                    bg="whiteAlpha.50"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                    transition="all 0.15s"
                    _hover={{
                      borderColor: "blue.400/30",
                      bg: "blue.500/5",
                    }}
                    role="group"
                    minW={0}
                  >
                    <Box minW="0" flex="1">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="white"
                        lineClamp={2}
                        mb={1}
                      >
                        {p.nome}
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight="800"
                        color="blue.300"
                        fontVariantNumeric="tabular-nums"
                      >
                        {p.preco.toFixed(2).replace(".", ",")}
                      </Text>
                    </Box>
                    {isPremium && (
                      <IconButton
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        rounded="lg"
                        flexShrink={0}
                        opacity={{ base: 1, md: 0 }}
                        _groupHover={{ opacity: 1 }}
                        onClick={() => deleteProduto(p.id)}
                        aria-label="Remover produto"
                      >
                        <X size={18} />
                      </IconButton>
                    )}
                  </Flex>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Grid>
    </VStack>
  );
}
