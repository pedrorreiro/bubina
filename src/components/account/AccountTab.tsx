"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Store } from "lucide-react";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { toast } from "sonner";
import {
  Box,
  Flex,
  Grid,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
  Center,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { appPanelProps } from "@/theme/layout";
import { maskPhone } from "@/lib/utils";
import type { Loja } from "@/types";

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

const STORE_FIELDS = ["nome", "telefone", "endereco"] as const;
type StoreField = (typeof STORE_FIELDS)[number];

function normalizeField(value: string | null | undefined) {
  return (value ?? "").trim();
}

function hasStoreChanges(base: Pick<Loja, StoreField>, next: Pick<Loja, StoreField>) {
  return STORE_FIELDS.some(
    (field) => normalizeField(base[field]) !== normalizeField(next[field]),
  );
}

export function AccountTab() {
  const { loja, setLoja, isLoading: isAppLoading } = useApp();
  const [localLoja, setLocalLoja] = useState(loja);
  const [isSavingStore, setIsSavingStore] = useState(false);

  useEffect(() => {
    setLocalLoja(loja);
  }, [loja]);

  const hasPendingStoreChanges = hasStoreChanges(loja, localLoja);

  const handleTextChange = (field: StoreField, value: string) => {
    setLocalLoja((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStore = async () => {
    if (!hasPendingStoreChanges) return;

    const updatedLoja = { ...loja, ...localLoja };
    try {
      setIsSavingStore(true);
      await setLoja(updatedLoja);
      toast.success("Dados da loja salvos");
    } catch (e) {
      toast.error(
        `Erro ao salvar dados da loja: ${e instanceof Error ? e.message : e}`,
      );
    } finally {
      setIsSavingStore(false);
    }
  };

  if (isAppLoading) {
    return (
      <Center py="24">
        <Spinner size="lg" color="blue.400" borderWidth="3px" />
      </Center>
    );
  }

  return (
    <VStack align="stretch" gap={{ base: 5, lg: 6 }} w="full" maxW={{ lg: "100%" }}>
      <Grid
        templateColumns={{ base: "1fr", lg: "minmax(280px, 340px) 1fr" }}
        gap={{ base: 5, lg: 6 }}
        alignItems="start"
      >
        <Box position={{ base: "static", lg: "sticky" }} top={{ lg: 6 }} w="full">
          <SubscriptionCard />
        </Box>

        <Box {...appPanelProps} overflow="hidden">
          <Box p={{ base: 5, md: 6 }}>
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
                <Store size={20} strokeWidth={1.75} />
              </Center>
              <Box minW="0">
                <Text
                  fontSize="11px"
                  fontWeight="semibold"
                  color="whiteAlpha.500"
                  textTransform="uppercase"
                  letterSpacing="0.06em"
                >
                  Identificação
                </Text>
                <Text fontSize="lg" fontWeight="700" letterSpacing="-0.02em" mt="0.5">
                  Dados da loja
                </Text>
              </Box>
            </Flex>

            <Stack gap={5} pt={5}>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Field label="Nome fantasia">
                  <Input
                    {...inputProps}
                    value={localLoja.nome || ""}
                    onChange={(e) => handleTextChange("nome", e.target.value)}
                    placeholder="Ex.: Panificadora Central"
                  />
                </Field>
                <Field label="WhatsApp / telefone">
                  <Input
                    {...inputProps}
                    value={localLoja.telefone || ""}
                    onChange={(e) =>
                      handleTextChange("telefone", maskPhone(e.target.value))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </Field>
              </Grid>
              <Field label="Endereço">
                <Input
                  {...inputProps}
                  value={localLoja.endereco || ""}
                  onChange={(e) => handleTextChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </Field>
              <Flex justify="flex-end">
                <Button
                  colorPalette="blue"
                  rounded="lg"
                  onClick={handleSaveStore}
                  disabled={!hasPendingStoreChanges || isSavingStore}
                  loading={isSavingStore}
                >
                  Salvar alterações
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Box>
      </Grid>
    </VStack>
  );
}
