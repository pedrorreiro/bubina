"use client";

import { useEffect, useState } from "react";
import { PlanCard } from "@/components/subscription/PlanCard";
import { useSubscription } from "@/hooks/useSubscription";
import { stripeApi } from "@/services/api/stripe";
import {
  Zap,
  Shield,
  ArrowLeft,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PAYWALL_COMPARISON_FEATURES,
  PLAN_ANNUAL_FEATURES,
  PLAN_MONTHLY_FEATURES,
} from "@/constants/pro-features";
import {
  Box,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";

const BG = "#020305";
const PRIMARY = "#5b9cf5";
const DIM = "#5c6478";
const MUTED = "#8f98ad";

export default function PaywallPage() {
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState("-");
  const [annualMonthlyEquivalent, setAnnualMonthlyEquivalent] = useState("-");
  const [annualDescription, setAnnualDescription] = useState(
    "Cobrança anual. Economia para negócios consolidados.",
  );

  useEffect(() => {
    const toMoney = (amountInCents: number, currency: string) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amountInCents / 100);

    const loadPrices = async () => {
      try {
        const data = await stripeApi.getPrices();
        const monthly = data.monthly;
        const annual = data.annual;

        if (monthly?.unitAmount && monthly.currency) {
          setMonthlyPrice(toMoney(monthly.unitAmount, monthly.currency));
        }

        if (annual?.unitAmount && annual.currency) {
          const monthlyEquivalent = annual.unitAmount / 12;
          setAnnualMonthlyEquivalent(toMoney(monthlyEquivalent, annual.currency));
          setAnnualDescription(
            `Cobrança anual de ${toMoney(annual.unitAmount, annual.currency)}. Economia para negócios consolidados.`,
          );
        }
      } catch (e) {
        console.error("Erro ao carregar preços do Stripe:", e);
      }
    };

    loadPrices();
  }, []);

  const handleCheckout = async (priceType: "monthly" | "annual") => {
    setLoading(priceType);
    const toastId = toast.loading("Preparando checkout seguro...");

    try {
      const { url } = await createCheckout(priceType);
      if (url) {
        toast.success("Redirecionando para o Stripe...", { id: toastId });
        window.location.href = url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (e) {
      console.error("Erro ao criar checkout:", e);
      toast.error("Erro ao iniciar checkout. Tente novamente.", { id: toastId });
      setLoading(null);
    }
  };

  return (
    <Flex
      minH="100dvh"
      flexDirection="column"
      align="center"
      bg={BG}
      py={{ base: "12", md: "20" }}
      position="relative"
      overflowX="hidden"
      pl={{ base: "max(1.5rem, env(safe-area-inset-left, 0px))", md: "max(2rem, env(safe-area-inset-left, 0px))" }}
      pr={{ base: "max(1.5rem, env(safe-area-inset-right, 0px))", md: "max(2rem, env(safe-area-inset-right, 0px))" }}
    >
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="60%"
        h="60%"
        bg={`${PRIMARY}1a`}
        rounded="full"
        filter="blur(140px)"
        pointerEvents="none"
        animation="pulse 10s infinite"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="50%"
        h="50%"
        bg={`${PRIMARY}0d`}
        rounded="full"
        filter="blur(140px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgImage="radial-gradient(circle at 50% 10%, rgba(59,130,246,0.03), transparent 70%)"
      />

      <Box position="relative" zIndex={1} w="full" maxW="5xl">
        <Box textAlign="center" mb="16">
          <Flex
            display="inline-flex"
            align="center"
            gap="2"
            px="4"
            py="1.5"
            bg="rgba(255,255,255,0.05)"
            borderWidth="1px"
            borderColor="rgba(255,255,255,0.1)"
            rounded="full"
            mb="8"
            backdropFilter="blur(24px)"
          >
            <Zap size={14} color={PRIMARY} />
            <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="0.3em" color={DIM}>
              Explore o próximo nível
            </Text>
          </Flex>

          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "5xl" }}
            fontWeight="bold"
            color="white"
            letterSpacing="tight"
            mb="6"
          >
            Eleve sua operação com o{" "}
            <Text as="span" color={PRIMARY} fontStyle="italic">
              Pro
            </Text>
          </Heading>

          <Text fontSize={{ base: "sm", md: "md" }} color={DIM} maxW="xl" mx="auto" lineHeight="relaxed">
            Abandone os limites do plano gratuito e desbloqueie ferramentas profissionais.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="8" mb="16" maxW="4xl" mx="auto">
          <PlanCard
            title="Assinatura Mensal"
            price={monthlyPrice}
            period="/mês"
            description="Flexibilidade total para o seu dia a dia."
            features={PLAN_MONTHLY_FEATURES}
            onSelect={() => handleCheckout("monthly")}
            loading={loading === "monthly"}
            disabled={loading !== null}
          />
          <PlanCard
            title="Assinatura Anual"
            price={annualMonthlyEquivalent}
            period="/mês"
            description={annualDescription}
            badge="17% DE ECONOMIA"
            features={PLAN_ANNUAL_FEATURES}
            highlighted
            onSelect={() => handleCheckout("annual")}
            loading={loading === "annual"}
            disabled={loading !== null}
          />
        </SimpleGrid>

        <Flex
          flexWrap="wrap"
          align="center"
          justify="center"
          gapX="12"
          gapY="6"
          color={MUTED}
          mb="24"
          opacity={0.6}
        >
          <Flex align="center" gap="3">
            <Shield size={18} color={PRIMARY} />
            <Text fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="0.2em">
              Checkout seguro Stripe
            </Text>
          </Flex>
          <Flex align="center" gap="3">
            <Zap size={18} color={PRIMARY} />
            <Text fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="0.2em">
              Ativação instantânea
            </Text>
          </Flex>
          <Flex align="center" gap="3">
            <CheckCircle2 size={18} color={PRIMARY} />
            <Text fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="0.2em">
              Sem multas de cancelamento
            </Text>
          </Flex>
        </Flex>

        <Box
          overflow="hidden"
          borderWidth="1px"
          borderColor="rgba(255,255,255,0.05)"
          rounded="2xl"
          boxShadow="2xl"
          mb="12"
          bg="rgba(20,22,30,0.7)"
          backdropFilter="blur(14px)"
        >
          <Box p={{ base: "6", md: "12" }} borderBottomWidth="1px" borderColor="rgba(255,255,255,0.05)" bg="rgba(255,255,255,0.01)">
            <Box textAlign="center">
              <Text fontSize="xs" fontWeight="bold" color={PRIMARY} textTransform="uppercase" letterSpacing="0.4em" mb="3">
                Visão detalhada
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="white" letterSpacing="tight">
                Compare as versões
              </Text>
            </Box>
          </Box>

          <Box p={{ base: "2", md: "8" }}>
            <Box display={{ base: "none", md: "block" }} overflowX="auto">
              <Table.Root native size="sm" variant="line" minW="full">
                <Table.Header>
                  <Table.Row borderBottomWidth="1px" borderColor="rgba(255,255,255,0.05)">
                    <Table.ColumnHeader px="6" py="6" textAlign="left" fontSize="11px" fontWeight="bold" color={DIM} textTransform="uppercase" letterSpacing="widest">
                      Funcionalidade
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="6" py="6" textAlign="center" fontSize="11px" fontWeight="bold" color={DIM} textTransform="uppercase" letterSpacing="widest">
                      Free
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="6" py="6" textAlign="center" fontSize="11px" fontWeight="bold" color={PRIMARY} textTransform="uppercase" letterSpacing="widest">
                      Premium
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {PAYWALL_COMPARISON_FEATURES.map((row, i) => (
                    <Table.Row
                      key={i}
                      borderBottomWidth="1px"
                      borderColor="rgba(255,255,255,0.04)"
                      _hover={{ bg: "rgba(255,255,255,0.01)" }}
                    >
                      <Table.Cell px="6" py="6">
                        <Text fontSize="sm" fontWeight="semibold" color="white">
                          {row.label}
                        </Text>
                      </Table.Cell>
                      <Table.Cell px="6" py="6" textAlign="center">
                        <Text fontSize="xs" fontWeight="medium" color={`${DIM}80`}>
                          {row.free}
                        </Text>
                      </Table.Cell>
                      <Table.Cell px="6" py="6" textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" color={PRIMARY}>
                          {row.pro}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            <Box display={{ base: "block", md: "none" }}>
              <Grid templateColumns="1.5fr 1fr 1fr" borderBottomWidth="1px" borderColor="rgba(255,255,255,0.1)" pb="4" mb="2" px="2">
                <Text fontSize="10px" fontWeight="bold" color={DIM} textTransform="uppercase" letterSpacing="widest" pl="2">
                  Recurso
                </Text>
                <Text fontSize="10px" fontWeight="bold" color={`${DIM}66`} textTransform="uppercase" letterSpacing="widest" textAlign="center">
                  Free
                </Text>
                <Text fontSize="10px" fontWeight="bold" color={PRIMARY} textTransform="uppercase" letterSpacing="widest" textAlign="center">
                  Pro
                </Text>
              </Grid>
              <Flex direction="column" gap="1">
                {PAYWALL_COMPARISON_FEATURES.map((row, i) => (
                  <Grid
                    key={i}
                    templateColumns="1.5fr 1fr 1fr"
                    alignItems="center"
                    py="4"
                    px="2"
                    rounded="xl"
                    bg={i % 2 === 0 ? "rgba(255,255,255,0.02)" : undefined}
                  >
                    <Text fontSize="11px" fontWeight="medium" color="rgba(255,255,255,0.8)" pl="2" lineHeight="tight">
                      {row.label}
                    </Text>
                    <Flex justify="center">
                      {row.free === "-" ? (
                        <X size={12} color={`${DIM}33`} />
                      ) : row.free === "Liberado" || row.free === "Automático" ? (
                        <Check size={12} color={`${DIM}66`} />
                      ) : (
                        <Text fontSize="9px" fontWeight="medium" color={`${DIM}66`} textAlign="center" lineHeight="none" px="1">
                          {row.free.replace(" por dia", "/d")}
                        </Text>
                      )}
                    </Flex>
                    <Flex justify="center">
                      {row.pro === "Liberado" || row.pro === "Automático" ? (
                        <Check size={14} color={PRIMARY} />
                      ) : (
                        <Text fontSize="10px" fontWeight="bold" color={PRIMARY} textAlign="center" lineHeight="none" px="1">
                          {row.pro === "Automático + Histórico Ilimitado" ? "Auto + Hist." : row.pro}
                        </Text>
                      )}
                    </Flex>
                  </Grid>
                ))}
              </Flex>
            </Box>
          </Box>
        </Box>

        <Box textAlign="center" pt="8">
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              color: DIM,
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={18} />
            Voltar ao painel
          </Link>
        </Box>
      </Box>
    </Flex>
  );
}
