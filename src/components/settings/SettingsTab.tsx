"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { Store, X, Lock, PlusCircle, ImageIcon, Cloud } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { maskPhone } from "@/lib/utils";
import { StorageService } from "@/services/storage";
import { useDebouncedCallback } from "use-debounce";
import {
  Box,
  Flex,
  Grid,
  Text,
  Stack,
  Input,
  IconButton,
  Center,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: typeof Store;
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

function PremiumLockCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Flex
      align="center"
      gap="4"
      p="4"
      rounded="xl"
      bg="whiteAlpha.50"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="whiteAlpha.100"
    >
      <Center w="10" h="10" rounded="full" bg="blue.500/10" color="blue.300" flexShrink={0}>
        <Lock size={18} />
      </Center>
      <Box flex="1" minW="0">
        <Text fontSize="sm" fontWeight="semibold">
          {title}
        </Text>
        <Text fontSize="12px" color="whiteAlpha.500" mt="1" lineHeight="short">
          {description}
        </Text>
        <Button asChild size="sm" colorPalette="blue" mt="3" rounded="lg" fontWeight="600">
          <Link href="/paywall">Ver planos</Link>
        </Button>
      </Box>
    </Flex>
  );
}

export function SettingsTab() {
  const {
    loja,
    userId,
    setLoja,
    updatePrinterStatus,
    isLoading: isAppLoading,
  } = useApp();
  const { subscription, isLoading: isSubLoading } = useSubscription();
  const isLoading = isAppLoading || isSubLoading;
  const isPremium = subscription?.active;

  useEffect(() => {
    updatePrinterStatus();
  }, [updatePrinterStatus]);

  const [localLoja, setLocalLoja] = useState(loja);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setLocalLoja(loja);
  }, [loja]);

  const debouncedSave = useDebouncedCallback((updatedLoja: typeof loja) => {
    setLoja(updatedLoja);
  }, 800);

  useEffect(() => {
    const fieldsToDebounce = [
      "nome",
      "telefone",
      "endereco",
      "mensagem_rodape",
    ] as const;
    const hasChanged = fieldsToDebounce.some((f) => localLoja[f] !== loja[f]);

    if (hasChanged) {
      debouncedSave({ ...loja, ...localLoja });
    }
  }, [localLoja, loja, debouncedSave, setLoja]);

  type LojaDebouncedStringField =
    | "nome"
    | "telefone"
    | "endereco"
    | "mensagem_rodape";

  const handleTextChange = (field: LojaDebouncedStringField, value: string) => {
    setLocalLoja((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      const publicUrl = await StorageService.uploadLogo(file, userId);
      await setLoja({ ...loja, logo_url: publicUrl, logo_metodo: "dither" });
      setLocalPreview(null);
      toast.success("Logo enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar logo.");
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = async () => {
    if (loja.logo_url) {
      await StorageService.deleteLogo(loja.logo_url);
      const newLoja = { ...loja };
      delete newLoja.logo_url;
      delete newLoja.logo_metodo;
      await setLoja(newLoja);
      toast.info("Logo removida.");
    }
  };

  if (isLoading) {
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

        <VStack align="stretch" gap={5}>
          {/* Dados da loja */}
          <Box className="app-panel" overflow="hidden">
            <Box p={{ base: 5, md: 6 }}>
              <SectionHeader
                icon={Store}
                eyebrow="Identificação"
                title="Dados da loja"
              />
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
              </Stack>
            </Box>
          </Box>

          {/* Cupom: rodapé + logo */}
          <Box className="app-panel" overflow="hidden">
            <Box p={{ base: 5, md: 6 }}>
              <SectionHeader
                icon={ImageIcon}
                eyebrow="Aparência"
                title="Cupom impresso"
              />
              <Stack gap={6} pt={5}>
                {isPremium ? (
                  <Field
                    label="Mensagem de rodapé"
                    helperText="Texto no final do cupom (linha única curta funciona melhor na térmica)."
                  >
                    <Input
                      {...inputProps}
                      value={localLoja.mensagem_rodape || ""}
                      onChange={(e) =>
                        handleTextChange("mensagem_rodape", e.target.value)
                      }
                      placeholder="Ex.: Obrigado pela preferência!"
                    />
                  </Field>
                ) : (
                  <PremiumLockCard
                    title="Rodapé personalizado"
                    description="No Pro você altera a frase padrão do rodapé nos cupons."
                  />
                )}

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="whiteAlpha.700"
                    mb={3}
                  >
                    Logomarca
                  </Text>
                  {!isPremium ? (
                    <PremiumLockCard
                      title="Logo no topo do cupom"
                      description="Envie PNG ou JPG otimizado para impressão térmica no plano Pro."
                    />
                  ) : !loja.logo_url ? (
                    <Box position="relative" rounded="xl" overflow="hidden">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        position="absolute"
                        inset={0}
                        w="full"
                        h="full"
                        opacity={0}
                        zIndex={2}
                        cursor="pointer"
                      />
                      <Center
                        flexDir="column"
                        gap={3}
                        py={10}
                        px={4}
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="whiteAlpha.100"
                        rounded="xl"
                        bg="whiteAlpha.50"
                        transition="all 0.15s"
                        _hover={{ borderColor: "blue.400/35", bg: "blue.500/5" }}
                        minH="160px"
                      >
                        {localPreview ? (
                          <Box position="relative">
                            <Box asChild rounded="lg" overflow="hidden" shadow="md">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={localPreview}
                                alt="Preview"
                                style={{
                                  height: "5rem",
                                  width: "auto",
                                  maxWidth: "100%",
                                  objectFit: "contain",
                                  display: "block",
                                  opacity: isUploading ? 0.35 : 1,
                                  filter: isUploading ? "grayscale(1) blur(2px)" : "none",
                                }}
                              />
                            </Box>
                            {isUploading && (
                              <Center position="absolute" inset={0}>
                                <Spinner size="md" color="blue.400" />
                              </Center>
                            )}
                          </Box>
                        ) : (
                          <>
                            <Center
                              w="12"
                              h="12"
                              rounded="full"
                              bg="whiteAlpha.80"
                              color="whiteAlpha.400"
                            >
                              <PlusCircle size={22} />
                            </Center>
                            <Box textAlign="center">
                              <Text fontSize="sm" fontWeight="semibold">
                                Enviar imagem
                              </Text>
                              <Text fontSize="12px" color="whiteAlpha.500" mt={1}>
                                PNG ou JPG · ideal largura ~384px na térmica
                              </Text>
                            </Box>
                          </>
                        )}
                      </Center>
                    </Box>
                  ) : (
                    <>
                      {/* Mobile: cabeçalho + remover na mesma linha; preview largo embaixo */}
                      <VStack
                        display={{ base: "flex", sm: "none" }}
                        align="stretch"
                        gap={4}
                        p={4}
                        rounded="xl"
                        bg="blue.500/6"
                        borderWidth="1px"
                        borderColor="blue.400/20"
                      >
                        <Flex justify="space-between" align="flex-start" gap={3} w="full">
                          <Box minW={0} flex="1" pr={2}>
                            <Text fontSize="sm" fontWeight="semibold">
                              Logo ativa
                            </Text>
                            <Text fontSize="12px" color="whiteAlpha.500" mt={1} lineHeight="short">
                              Aparece no topo do cupom ao imprimir.
                            </Text>
                          </Box>
                          <IconButton
                            aria-label="Remover logo"
                            variant="surface"
                            colorPalette="red"
                            rounded="lg"
                            flexShrink={0}
                            size="sm"
                            onClick={removeLogo}
                          >
                            <X size={18} />
                          </IconButton>
                        </Flex>
                        <Center
                          w="full"
                          minH="120px"
                          rounded="lg"
                          bg="whiteAlpha.50"
                          borderWidth="1px"
                          borderColor="whiteAlpha.100"
                          px={4}
                          py={5}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={loja.logo_url}
                            alt="Logo da loja"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "132px",
                              width: "auto",
                              height: "auto",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        </Center>
                      </VStack>

                      {/* Tablet/desktop: linha compacta */}
                      <Flex
                        display={{ base: "none", sm: "flex" }}
                        align="center"
                        justify="space-between"
                        gap={4}
                        p={4}
                        rounded="xl"
                        bg="blue.500/6"
                        borderWidth="1px"
                        borderColor="blue.400/20"
                      >
                        <Flex align="center" gap={4} minW={0} flex="1">
                          <Center
                            w="4.5rem"
                            h="4.5rem"
                            rounded="lg"
                            bg="whiteAlpha.80"
                            borderWidth="1px"
                            borderColor="whiteAlpha.100"
                            p={2}
                            flexShrink={0}
                          >
                            <Box asChild w="full" h="full">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={loja.logo_url}
                                alt="Logo da loja"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </Box>
                          </Center>
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight="semibold">
                              Logo ativa
                            </Text>
                            <Text fontSize="12px" color="whiteAlpha.500" mt={0.5}>
                              Aparece no topo do cupom ao imprimir.
                            </Text>
                          </Box>
                        </Flex>
                        <IconButton
                          aria-label="Remover logo"
                          variant="subtle"
                          colorPalette="red"
                          rounded="lg"
                          flexShrink={0}
                          onClick={removeLogo}
                        >
                          <X size={18} />
                        </IconButton>
                      </Flex>
                    </>
                  )}
                </Box>

                <Flex
                  align="center"
                  gap={2.5}
                  py={2.5}
                  px={3}
                  rounded="lg"
                  bg="whiteAlpha.50"
                  borderWidth="1px"
                  borderColor="var(--color-edge)"
                >
                  <Box color="blue.300" flexShrink={0} lineHeight={0}>
                    <Cloud size={14} />
                  </Box>
                  <Text fontSize="12px" color="whiteAlpha.500" lineHeight="short">
                    <Text as="span" fontWeight="semibold" color="whiteAlpha.700">
                      Salvamento automático.
                    </Text>{" "}
                    Alterações nos dados da loja são sincronizadas na nuvem.
                  </Text>
                </Flex>
              </Stack>
            </Box>
          </Box>
        </VStack>
      </Grid>
    </VStack>
  );
}
