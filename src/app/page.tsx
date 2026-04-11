"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bluetooth,
  Cloud,
  Command,
  Monitor,
  Printer,
  Shield,
  Zap,
} from "lucide-react";
import { FaAndroid, FaApple, FaLinux, FaWindows } from "react-icons/fa";
import {
  Box,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { safeGutterX } from "@/theme/layout";

const BRAND = "#5b9cf5";
const BG = "#0a0b10";
const SURFACE = "#14161e";
const MUTED = "#8f98ad";
const DIM = "#5c6478";
const GREEN = "#3ecf8e";
const AMBER = "#fbbf5c";

const features = [
  {
    icon: Bluetooth,
    title: "Venda sem fio",
    desc: "Conexão Bluetooth direta. Sem drivers, sem cabos.",
  },
  {
    icon: Zap,
    title: "Fluxo instantâneo",
    desc: "Monte o pedido e imprima em segundos.",
  },
  {
    icon: Cloud,
    title: "Sempre sincronizado",
    desc: "Dados na nuvem, acessíveis em qualquer lugar.",
  },
  {
    icon: Shield,
    title: "Segurança",
    desc: "Dados criptografados e acesso só com login.",
  },
];

const steps = [
  {
    num: "01",
    title: "Acesse",
    desc: "Abra a Bubina no navegador do celular.",
  },
  {
    num: "02",
    title: "Conecte",
    desc: "Pareie a impressora térmica via Bluetooth.",
  },
  {
    num: "03",
    title: "Imprima",
    desc: "Venda, monte o cupom e imprima na hora.",
  },
];

function Nav() {
  return (
    <Box
      as="header"
      position="fixed"
      top={{ base: "4", md: "6" }}
      left="50%"
      transform="translateX(-50%)"
      zIndex={50}
      w="full"
      maxW="5xl"
      {...safeGutterX}
    >
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        rounded="2xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        bg="whiteAlpha.100"
        px="6"
        py="3"
        backdropFilter="blur(16px)"
        boxShadow="2xl"
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap="2.5">
            <Flex
              h="9"
              w="9"
              align="center"
              justify="center"
              rounded="xl"
              bg={BRAND}
              boxShadow={`0 8px 24px ${BRAND}55`}
            >
              <Printer size={18} color="#fff" strokeWidth={2.5} />
            </Flex>
            <Text
              fontSize="lg"
              fontWeight="black"
              letterSpacing="tight"
              color="white"
            >
              Bubina
            </Text>
          </Flex>
        </Link>
        <Flex align="center" gap="4">
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={MUTED}
              _hover={{ color: "white" }}
            >
              Explorar
            </Text>
          </Link>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Flex
              as="span"
              rounded="xl"
              bg="white"
              px="5"
              py="2"
              fontSize="sm"
              fontWeight="bold"
              color={BG}
              _hover={{ bg: "whiteAlpha.900" }}
            >
              Entrar
            </Flex>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}

function PlatformCompatibilityHero() {
  return (
    <Box
      as="section"
      position="relative"
      py={{ base: "16", sm: "24", md: "28" }}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(180deg, ${SURFACE}99 0%, ${BG} 50%, ${SURFACE}66 100%)`}
    >
      <Box maxW="7xl" mx="auto" {...safeGutterX}>
        <VStack
          textAlign="center"
          gap="4"
          mb={{ base: "10", md: "14" }}
          maxW="3xl"
          mx="auto"
        >
          <Flex
            display="inline-flex"
            align="center"
            gap="2"
            px="3"
            py="1"
            rounded="full"
            borderWidth="1px"
            borderColor={`${BRAND}40`}
            bg={`${BRAND}14`}
            fontSize="10px"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.22em"
            color={BRAND}
          >
            <Bluetooth size={12} strokeWidth={2.5} />
            Web Bluetooth
          </Flex>
          <Heading
            as="h2"
            fontSize={{ base: "2rem", sm: "3rem", md: "3.25rem" }}
            fontWeight="black"
            letterSpacing="tight"
            lineHeight={{ base: 1.3, sm: 1.25 }}
            color="white"
          >
            Impressão no papel,{" "}
            <Text as="span" display="inline" color={BRAND}>
              dispositivo a dispositivo
            </Text>
          </Heading>
          <Text
            fontSize={{ base: "md", sm: "lg" }}
            lineHeight="relaxed"
            color={MUTED}
          >
            O pareamento com a impressora térmica usa o padrão Web Bluetooth do
            navegador. Cada sistema oferece suporte diferente — veja onde está
            liberado hoje.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: "5", md: "6" }}>
          {/* Android */}
          <Flex
            direction="column"
            align="stretch"
            rounded="2xl"
            borderWidth="1px"
            borderColor="rgba(62,207,142,0.35)"
            bg="rgba(62,207,142,0.06)"
            p={{ base: "6", md: "8" }}
            transition="border-color 0.2s, box-shadow 0.2s"
            _hover={{
              borderColor: "rgba(62,207,142,0.5)",
              boxShadow: `0 0 0 1px ${GREEN}22`,
            }}
          >
            <Flex
              h="14"
              w="14"
              align="center"
              justify="center"
              rounded="2xl"
              bg="rgba(62,207,142,0.15)"
              color="#3ddc84"
              mb="5"
            >
              <FaAndroid size={34} aria-hidden />
            </Flex>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.2em"
              color={GREEN}
              mb="2"
            >
              Android
            </Text>
            <Heading
              as="h3"
              fontSize="xl"
              fontWeight="bold"
              color="white"
              mb="3"
            >
              Celular e tablet
            </Heading>
            <Flex
              align="center"
              gap="2"
              mb="4"
              alignSelf="flex-start"
              px="2.5"
              py="1"
              rounded="full"
              bg={`${GREEN}22`}
              borderWidth="1px"
              borderColor={`${GREEN}44`}
            >
              <Bluetooth size={14} color={GREEN} strokeWidth={2.5} />
              <Text
                fontSize="11px"
                fontWeight="bold"
                color={GREEN}
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Impressão completa
              </Text>
            </Flex>
            <Text fontSize="sm" lineHeight="tall" color={MUTED} flex="1">
              No Chrome e em navegadores compatíveis, você pareia a impressora e
              imprime sem instalar app nativo.
            </Text>
          </Flex>

          {/* Desktop */}
          <Flex
            direction="column"
            align="stretch"
            rounded="2xl"
            borderWidth="1px"
            borderColor={`${BRAND}35`}
            bg={`${BRAND}0d`}
            p={{ base: "6", md: "8" }}
            transition="border-color 0.2s, box-shadow 0.2s"
            _hover={{
              borderColor: `${BRAND}55`,
              boxShadow: `0 0 0 1px ${BRAND}22`,
            }}
          >
            <Flex
              h="14"
              w="14"
              align="center"
              justify="center"
              rounded="2xl"
              bg={`${BRAND}22`}
              color={BRAND}
              mb="5"
            >
              <Monitor size={32} strokeWidth={2} aria-hidden />
            </Flex>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.2em"
              color={BRAND}
              mb="2"
            >
              Computador
            </Text>
            <Heading
              as="h3"
              fontSize="xl"
              fontWeight="bold"
              color="white"
              mb="3"
            >
              Windows, Mac ou Linux
            </Heading>
            <Flex gap="3" mb="4" flexWrap="wrap" align="center">
              <FaWindows
                size={22}
                color="#5eb3f6"
                title="Windows"
                aria-hidden
              />
              <FaApple size={22} color="#f5f5f5" title="macOS" aria-hidden />
              <FaLinux size={22} color="#fcc624" title="Linux" aria-hidden />
            </Flex>
            <Flex
              align="center"
              gap="2"
              mb="4"
              alignSelf="flex-start"
              px="2.5"
              py="1"
              rounded="full"
              bg={`${GREEN}22`}
              borderWidth="1px"
              borderColor={`${GREEN}44`}
            >
              <Bluetooth size={14} color={GREEN} strokeWidth={2.5} />
              <Text
                fontSize="11px"
                fontWeight="bold"
                color={GREEN}
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Impressão completa
              </Text>
            </Flex>
            <Text fontSize="sm" lineHeight="tall" color={MUTED} flex="1">
              No Chrome ou Edge, com Bluetooth no PC ou adaptador USB, o fluxo é
              o mesmo: abra a Bubina e conecte a impressora.
            </Text>
          </Flex>

          {/* iOS */}
          <Flex
            direction="column"
            align="stretch"
            rounded="2xl"
            borderWidth="1px"
            borderColor="rgba(251,191,92,0.35)"
            bg="rgba(251,191,92,0.05)"
            p={{ base: "6", md: "8" }}
            transition="border-color 0.2s"
            _hover={{ borderColor: "rgba(251,191,92,0.5)" }}
          >
            <Flex
              h="14"
              w="14"
              align="center"
              justify="center"
              rounded="2xl"
              bg="rgba(251,191,92,0.12)"
              color="#a1a1aa"
              mb="5"
            >
              <FaApple size={32} aria-hidden />
            </Flex>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.2em"
              color={AMBER}
              mb="2"
            >
              iPhone e iPad
            </Text>
            <Heading
              as="h3"
              fontSize="xl"
              fontWeight="bold"
              color="white"
              mb="3"
            >
              Safari no iOS
            </Heading>
            <Flex
              align="center"
              gap="2"
              mb="4"
              alignSelf="flex-start"
              px="2.5"
              py="1"
              rounded="full"
              bg="rgba(251,191,92,0.12)"
              borderWidth="1px"
              borderColor="rgba(251,191,92,0.35)"
            >
              <Text
                fontSize="11px"
                fontWeight="bold"
                color={AMBER}
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Bluetooth indisponível
              </Text>
            </Flex>
            <Text fontSize="sm" lineHeight="tall" color={MUTED} flex="1">
              A Apple ainda não expõe Web Bluetooth no Safari para esse tipo de
              uso. Para imprimir no balcão, use um aparelho Android ou um
              computador com Chrome — o restante do Bubina (pedido, histórico,
              catálogo) funciona normalmente no iPhone.
            </Text>
          </Flex>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <Box as="main" minH="100dvh" bg={BG} color="#e4e8f0" overflowX="hidden">
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        pointerEvents="none"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-10%"
          left="50%"
          h="500px"
          w="800px"
          transform="translateX(-50%)"
          rounded="full"
          bg={`${BRAND}1a`}
          filter="blur(120px)"
        />
        <Box
          position="absolute"
          top="40%"
          right="-10%"
          h="400px"
          w="400px"
          rounded="full"
          bg="rgba(56, 189, 248, 0.05)"
          filter="blur(100px)"
        />
      </Box>

      <Nav />

      {/* Hero */}
      <Box
        as="section"
        position="relative"
        pt={{ base: "140px", sm: "180px" }}
        pb={{ base: "20", sm: "32" }}
      >
        <Box maxW="7xl" mx="auto" {...safeGutterX}>
          <VStack align="center" textAlign="center" gap={0}>
            <Flex
              mb="6"
              display="inline-flex"
              align="center"
              gap="2"
              rounded="full"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              bg="whiteAlpha.50"
              px="4"
              py="1.5"
              fontSize="11px"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.2em"
              color="white"
            >
              <Command size={12} color={BRAND} />
              Gestão e impressão térmica
            </Flex>

            <Heading
              as="h1"
              maxW="4xl"
              fontSize={{ base: "3rem", sm: "4.5rem", md: "5rem" }}
              fontWeight="black"
              lineHeight={{ base: 1.18, sm: 1.15, md: 1.12 }}
              letterSpacing="tight"
              color="white"
            >
              Acelere as vendas no{" "}
              <Text
                as="span"
                display="inline"
                bgGradient="linear(to-b, white, white, rgba(91,156,245,0.4))"
                bgClip="text"
                color="transparent"
              >
                seu negócio.
              </Text>
            </Heading>

            <Text
              mt="8"
              maxW="2xl"
              fontSize={{ base: "lg", sm: "xl" }}
              lineHeight="relaxed"
              color={MUTED}
            >
              PDV focado em agilidade. Catálogo, pagamentos e cupom via
              Bluetooth no dispositivo.
            </Text>

            <VStack mt="12" gap="6" w="full" align="center">
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  width: "100%",
                  maxWidth: "320px",
                }}
              >
                <Flex
                  as="span"
                  w="full"
                  h="14"
                  align="center"
                  justify="center"
                  gap="2"
                  rounded="2xl"
                  bg={BRAND}
                  px="10"
                  fontSize="md"
                  fontWeight="bold"
                  color="white"
                  boxShadow={`0 20px 40px ${BRAND}40`}
                  transition="transform 0.15s"
                  _hover={{ transform: "scale(1.02)" }}
                  _active={{ transform: "scale(0.98)" }}
                >
                  Criar conta e iniciar teste
                  <ArrowRight size={18} />
                </Flex>
              </Link>
              <Flex
                align="center"
                gap="2"
                fontSize="sm"
                fontWeight="medium"
                color={DIM}
              >
                <Shield size={16} />
                Acesso por assinatura. Teste grátis disponível.
              </Flex>
            </VStack>
          </VStack>
        </Box>
      </Box>

      <PlatformCompatibilityHero />

      {/* Features */}
      <Box as="section" py={{ base: "16", sm: "32" }}>
        <Box maxW="7xl" mx="auto" {...safeGutterX}>
          <Box mb="20" maxW="3xl">
            <Heading
              as="h2"
              fontSize={{ base: "2.5rem", sm: "3.75rem" }}
              fontWeight="black"
              letterSpacing="tight"
              lineHeight={{ base: 1.3, sm: 1.22 }}
              color="white"
            >
              Sua operação{" "}
              <Text as="span" display="inline" color={BRAND}>
                mais inteligente.
              </Text>
            </Heading>
            <Text mt="6" fontSize="lg" lineHeight="relaxed" color={MUTED}>
              Menos cliques, mais ritmo no balcão: cadastre, venda e imprima em
              sequência.
            </Text>
          </Box>

          <Flex
            direction={{ base: "column", sm: "row" }}
            gap="8"
            mb="12"
            rounded="3xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg={`${BRAND}0d`}
            p={{ base: "8", sm: "10" }}
            align={{ sm: "center" }}
          >
            <Box flex="1">
              <Flex align="center" gap="3" mb="3">
                <Flex
                  h="10"
                  w="10"
                  align="center"
                  justify="center"
                  rounded="xl"
                  bg={BRAND}
                  color="white"
                  boxShadow={`0 8px 24px ${BRAND}33`}
                >
                  <Printer size={20} />
                </Flex>
                <Heading as="h3" fontSize="xl" fontWeight="black" color="white">
                  Impressoras compatíveis
                </Heading>
              </Flex>
              <Text fontSize="md" color={MUTED}>
                ESC/POS via Bluetooth Web — mini térmicas 58mm ou 80mm.
              </Text>
            </Box>
            <Flex flexWrap="wrap" gap="3">
              {["PT-210", "MTP-II / MTP-3", "Goojprt", "Genéricos"].map((p) => (
                <Box
                  key={p}
                  rounded="full"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  bg="whiteAlpha.50"
                  px="5"
                  py="2"
                  fontSize="xs"
                  fontWeight="bold"
                  color="white"
                >
                  {p}
                </Box>
              ))}
            </Flex>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: "6", md: "8" }}>
            {features.map((f) => (
              <Box
                key={f.title}
                position="relative"
                overflow="hidden"
                rounded="3xl"
                borderWidth="1px"
                borderColor="whiteAlpha.200"
                bg={`${SURFACE}66`}
                p="10"
                backdropFilter="blur(8px)"
                transition="border-color 0.2s"
                _hover={{ borderColor: `${BRAND}66` }}
              >
                <VStack align="start" gap={0} h="full">
                  <Flex
                    mb="8"
                    h="12"
                    w="12"
                    align="center"
                    justify="center"
                    rounded="xl"
                    bg={`${BRAND}1a`}
                    color={BRAND}
                  >
                    <f.icon size={24} strokeWidth={2} />
                  </Flex>
                  <Heading
                    as="h3"
                    fontSize={{ base: "xl", sm: "2xl" }}
                    fontWeight="bold"
                    color="white"
                    mb="3"
                  >
                    {f.title}
                  </Heading>
                  <Text fontSize="md" lineHeight="relaxed" color={MUTED}>
                    {f.desc}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Steps */}
      <Box
        as="section"
        py={{ base: "16", sm: "32" }}
        borderYWidth="1px"
        borderColor="whiteAlpha.100"
        bg={`${SURFACE}4d`}
      >
        <Box maxW="7xl" mx="auto" {...safeGutterX}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap="16"
            alignItems="center"
          >
            <Box>
              <Text
                mb="4"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.2em"
                color={BRAND}
              >
                Processo ágil
              </Text>
              <Heading
                as="h2"
                fontSize={{ base: "2.5rem", sm: "3.75rem" }}
                fontWeight="black"
                letterSpacing="tight"
                lineHeight={{ base: 1.3, sm: 1.22 }}
                color="white"
              >
                Do bolso para o{" "}
                <Text as="span" display="inline" color={BRAND}>
                  papel.
                </Text>
              </Heading>
              <Text
                mt="8"
                maxW="lg"
                fontSize="lg"
                lineHeight="relaxed"
                color={MUTED}
              >
                Menos fricção técnica: abra, conecte quando for imprimir e
                atenda a fila.
              </Text>
            </Box>
            <VStack gap="6" align="stretch">
              {steps.map((s) => (
                <Flex
                  key={s.num}
                  align="flex-start"
                  gap="6"
                  rounded="3xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  bg={`${SURFACE}80`}
                  p="8"
                  transition="border-color 0.2s"
                  _hover={{ borderColor: "whiteAlpha.200" }}
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="black"
                    fontVariantNumeric="tabular-nums"
                    color={`${BRAND}66`}
                  >
                    {s.num}
                  </Text>
                  <Box>
                    <Heading
                      as="h3"
                      fontSize="xl"
                      fontWeight="bold"
                      color="white"
                      mb="2"
                    >
                      {s.title}
                    </Heading>
                    <Text fontSize="md" color={MUTED}>
                      {s.desc}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Grid>
        </Box>
      </Box>

      {/* CTA */}
      <Box as="section" py={{ base: "16", sm: "32" }}>
        <Box maxW="5xl" mx="auto" {...safeGutterX}>
          <Box
            position="relative"
            overflow="hidden"
            rounded="3xl"
            borderWidth="1px"
            borderColor={`${BRAND}33`}
            bgGradient="linear(to-br, rgba(91,156,245,0.12), #14161e, #14161e)"
            px={{ base: "8", sm: "12" }}
            py={{ base: "12", sm: "20" }}
            textAlign="center"
            boxShadow="2xl"
          >
            <Box position="relative" zIndex={1}>
              <Heading
                as="h2"
                maxW="3xl"
                mx="auto"
                fontSize={{ base: "2.25rem", sm: "4.5rem" }}
                fontWeight="black"
                letterSpacing="tight"
                lineHeight={{ base: 1.28, sm: 1.2 }}
                color="white"
              >
                Pronto para agilizar o seu negócio?
              </Heading>
              <Text mt="8" fontSize={{ base: "lg", sm: "xl" }} color={MUTED}>
                Simplifique o balcão com impressão térmica pelo navegador.
              </Text>
              <Flex
                mt="12"
                direction={{ base: "column", sm: "row" }}
                align="center"
                justify="center"
                gap="4"
              >
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Flex
                    as="span"
                    h="14"
                    minW="240px"
                    align="center"
                    justify="center"
                    rounded="2xl"
                    bg="white"
                    px="10"
                    fontSize="md"
                    fontWeight="bold"
                    color={BG}
                    _hover={{ bg: "whiteAlpha.900" }}
                  >
                    Criar conta grátis
                  </Flex>
                </Link>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Flex
                    as="span"
                    h="14"
                    minW="200px"
                    align="center"
                    justify="center"
                    rounded="2xl"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                    bg="whiteAlpha.50"
                    px="8"
                    fontSize="sm"
                    fontWeight="bold"
                    color="white"
                    _hover={{ bg: "whiteAlpha.100" }}
                  >
                    Saiba mais
                  </Flex>
                </Link>
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        borderTopWidth="1px"
        borderColor="whiteAlpha.100"
        py="12"
      >
        <Box maxW="7xl" mx="auto" {...safeGutterX}>
          <Flex
            direction={{ base: "column", sm: "row" }}
            align="center"
            justify="space-between"
            gap="8"
          >
            <Flex align="center" gap="3">
              <Command size={20} color={BRAND} />
              <Text
                fontSize="sm"
                fontWeight="bold"
                letterSpacing="widest"
                textTransform="uppercase"
                color="white"
              >
                Bubina System
              </Text>
            </Flex>
            <Text
              fontSize="xs"
              color={DIM}
              textTransform="uppercase"
              letterSpacing="0.2em"
            >
              © {new Date().getFullYear()} — foco em velocidade
            </Text>
            <Flex
              gap="6"
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="widest"
              color={MUTED}
            >
              <Link href="#" style={{ textDecoration: "none" }}>
                <Text _hover={{ color: "white" }}>Termos</Text>
              </Link>
              <Link href="#" style={{ textDecoration: "none" }}>
                <Text _hover={{ color: "white" }}>Privacidade</Text>
              </Link>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
