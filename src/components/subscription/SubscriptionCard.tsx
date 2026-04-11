"use client";

import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionStatus } from "@/types";
import { toast } from "sonner";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Center,
  Progress,
  Grid,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";

export function SubscriptionCard() {
  const {
    subscription: sub,
    isLoading,
    openPortal,
    cancelSubscription,
  } = useSubscription();

  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const { url } = await openPortal();
      if (url) window.open(url, "_blank");
    } catch {
      toast.error("Erro ao abrir o portal de assinatura");
    }
    setPortalLoading(false);
  };

  const handleCancelPlan = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso Premium até o final do período já pago, mas o plano não será renovado automaticamente.",
      )
    ) {
      return;
    }

    setCancelLoading(true);
    try {
      const res = await cancelSubscription();
      toast.success(res.message || "Assinatura cancelada com sucesso.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao cancelar assinatura";
      toast.error(message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box className="app-panel" overflow="hidden">
        <Center py="12">
          <Spinner color="blue.400" size="lg" borderWidth="3px" />
        </Center>
      </Box>
    );
  }

  if (!sub) return null;

  const trialEndTime = sub.trialEndsAt
    ? new Date(sub.trialEndsAt).getTime()
    : 0;
  const msRemaining = Math.max(0, trialEndTime - now);
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  const formatTrialTime = () => {
    if (msRemaining <= 0) return "Expirado";
    const totalMinutes = Math.floor(msRemaining / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    if (days >= 1) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    return hours >= 1 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const statusConfig = getStatusConfig(sub, hoursRemaining / 24);

  return (
    <Box className="app-panel" overflow="hidden" h="full">
      <Box p={{ base: 5, md: 6 }}>
        <Flex align="center" gap="3" pb="4" mb="1" borderBottomWidth="1px" borderColor="var(--color-edge)">
          <Center
            w="10"
            h="10"
            rounded="xl"
            bg="blue.500/12"
            color="blue.300"
            flexShrink={0}
          >
            <CreditCard size={20} strokeWidth={1.75} />
          </Center>
          <Box minW="0">
            <Text
              fontSize="11px"
              fontWeight="semibold"
              color="whiteAlpha.500"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              Plano
            </Text>
            <Heading size="md" fontWeight="700" letterSpacing="-0.02em" mt="0.5">
              Assinatura
            </Heading>
          </Box>
        </Flex>

        <Box
          p={4}
          rounded="xl"
          bg={statusConfig.bg}
          borderWidth="1px"
          borderColor={statusConfig.borderColor}
          mt={5}
          mb={5}
        >
          <Flex align="center" gap="4">
            <Center
              w="10"
              h="10"
              borderRadius="xl"
              bg="whiteAlpha.100"
              color={statusConfig.color}
            >
              <statusConfig.icon size={20} />
            </Center>
            <Box flex="1">
              <Text fontSize="sm" fontWeight="bold" color={statusConfig.color}>
                {statusConfig.label}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.500" mt="0.5">
                {statusConfig.description}
              </Text>

              {(sub.currentPeriodEnd ||
                (sub.reason === "trial" && sub.trialEndsAt)) && (
                <Box
                  mt="2"
                  py="1"
                  px="2.5"
                  bg="blackAlpha.200"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.50"
                  w="fit-content"
                >
                  <Text
                    fontSize="10px"
                    fontWeight="bold"
                    color="whiteAlpha.600"
                  >
                    Vence em:{" "}
                    {formatDate(sub.currentPeriodEnd || sub.trialEndsAt)}
                  </Text>
                </Box>
              )}
            </Box>
          </Flex>

          {/* Trial Progress Bar */}
          {sub.reason === "trial" && msRemaining > 0 && (
            <Box
              mt="6"
              pt="6"
              borderTop="1px solid"
              borderColor="whiteAlpha.50"
            >
              <Flex justify="space-between" align="center" mb="2">
                <Text
                  fontSize="10px"
                  fontWeight="bold"
                  color="whiteAlpha.400"
                  textTransform="uppercase"
                >
                  Tempo Restante
                </Text>
                <Text fontSize="xs" fontWeight="bold" color="blue.400">
                  {formatTrialTime()}
                </Text>
              </Flex>
              <Progress.Root
                value={Math.min(100, (hoursRemaining / 72) * 100)}
                colorPalette="blue"
                size="xs"
                borderRadius="full"
              >
                <Progress.Track bg="blackAlpha.400" borderRadius="full" h="1.5">
                  <Progress.Range borderRadius="full" />
                </Progress.Track>
              </Progress.Root>
            </Box>
          )}
        </Box>

        <Stack gap={3}>
          {sub.reason === "manual" ? (
            <Stack
              align="center"
              p={4}
              bg="blue.500/8"
              rounded="xl"
              borderWidth="1px"
              borderColor="blue.400/20"
              textAlign="center"
              gap={3}
            >
              <CheckCircle2 size={24} className="text-blue-400" />
              <Box>
                <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">
                  Acesso Bubina Pro
                </Text>
                <Text
                  fontSize="10px"
                  color="whiteAlpha.400"
                  textTransform="uppercase"
                >
                  Acesso vitalício concedido pela administração.
                </Text>
              </Box>
            </Stack>
          ) : sub.reason === "paid" ? (
            <Stack gap="4">
              <Button
                variant="subtle"
                h="11"
                rounded="lg"
                onClick={handleOpenPortal}
                disabled={portalLoading}
                bg="whiteAlpha.50"
                fontWeight="semibold"
                _hover={{ bg: "whiteAlpha.100" }}
              >
                {portalLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <ExternalLink size={16} />
                )}
                Gerenciar Assinatura
              </Button>

              {!sub.isCanceling && (
                <Button
                  variant="ghost"
                  colorPalette="red"
                  size="xs"
                  onClick={handleCancelPlan}
                  disabled={cancelLoading}
                  fontSize="10px"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  {cancelLoading ? "Processando..." : "Cancelar Assinatura"}
                </Button>
              )}
            </Stack>
          ) : (
            <Stack gap="6">
              <Box
                p={4}
                bg="whiteAlpha.50"
                rounded="xl"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
              >
                <HStack mb="4">
                  <Box w="1.5" h="6" bg="blue.400/40" borderRadius="full" />
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Vantagens do Pro
                  </Text>
                </HStack>
                <Grid
                  templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                  gapY="3"
                  gapX="6"
                >
                  {[
                    "Impressões Ilimitadas",
                    "Catálogo Custom",
                    "Logo no Cupom",
                    "Suporte 24h",
                  ].map((feat, i) => (
                    <HStack key={i} gap="2.5">
                      <CheckCircle2 size={14} className="text-blue-400" />
                      <Text
                        fontSize="11px"
                        fontWeight="semibold"
                        color="whiteAlpha.600"
                      >
                        {feat}
                      </Text>
                    </HStack>
                  ))}
                </Grid>
              </Box>

              <Button
                asChild
                h="12"
                colorPalette="blue"
                rounded="xl"
                fontWeight="700"
              >
                <a href="/paywall">
                  <Zap size={18} />
                  <Box textAlign="left">
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      lineHeight="1"
                    >
                      Assinar Bubina Pro
                    </Text>
                    <Text fontSize="9px" color="whiteAlpha.600" mt="1">
                      Libere todos os recursos agora
                    </Text>
                  </Box>
                  <ArrowRight size={18} />
                </a>
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function getStatusConfig(sub: SubscriptionStatus, trialDays: number) {
  if (sub.reason === "manual") {
    return {
      icon: CheckCircle2,
      label: "Premium Vitalício",
      description: "Acesso permanente a todos os recursos.",
      bg: "blue.500/5",
      borderColor: "blue.500/20",
      color: "blue.400",
    };
  }

  if (sub.isCanceling) {
    return {
      icon: Clock,
      label: "Cancelamento em Curso",
      description: "Acesso Pro garantido até o fim do ciclo.",
      bg: "red.500/5",
      borderColor: "red.500/20",
      color: "red.400",
    };
  }

  if (sub.reason === "trial") {
    if (trialDays <= 1) {
      return {
        icon: Zap,
        label: "Avaliação Expirando",
        description: "Assine para manter seus recursos Pro.",
        bg: "orange.500/5",
        borderColor: "orange.500/20",
        color: "orange.400",
      };
    }
    return {
      icon: Zap,
      label: "Avaliação Gratuita",
      description: `Aproveite os recursos Pro sem limites.`,
      bg: "blue.500/5",
      borderColor: "blue.500/20",
      color: "blue.400",
    };
  }

  if (sub.reason === "paid") {
    if (sub.subscriptionStatus === "past_due") {
      return {
        icon: AlertTriangle,
        label: "Pendente",
        description: "Houve um problema com o pagamento.",
        bg: "orange.500/5",
        borderColor: "orange.500/20",
        color: "orange.400",
      };
    }
    return {
      icon: CheckCircle2,
      label: "Plano Pro Ativo",
      description: "Sua assinatura está em dia.",
      bg: "green.500/5",
      borderColor: "green.500/20",
      color: "green.400",
    };
  }

  return {
    icon: Zap,
    label: "Plano Starter",
    description: "Você está no plano básico gratuito.",
    bg: "whiteAlpha.50",
    borderColor: "whiteAlpha.100",
    color: "whiteAlpha.600",
  };
}
