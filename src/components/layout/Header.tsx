"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  Bluetooth,
  Settings,
  Package,
  FileText,
  History,
  Unplug,
  User,
  LogOut,
} from "lucide-react";
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Circle,
  VStack,
  Badge,
  Center,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { Button } from "@/components/ui/button";

export function Header() {
  const {
    printerName,
    printerStatus,
    authorizedDevice,
    connectPrinter,
    disconnectPrinter,
    userEmail,
  } = useApp();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.status === 200) {
        window.location.href = "/";
      } else {
        toast.error("Erro ao sair");
      }
    } catch {
      toast.error("Erro de conexão ao sair");
    }
  };

  if (pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  const handleConnect = async (device?: BluetoothDevice) => {
    try {
      await connectPrinter(device)
        .then(() => {
          toast.success("Impressora conectada!");
        })
        .catch((e) => {
          const msg = e instanceof Error ? e.message : String(e);
          toast.error(`Falha: ${msg}`);
        });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("User cancelled")) {
        toast.error(`Falha: ${msg}`);
      }
    }
  };

  const tabs = [
    { id: "pedido", path: "/pedido", label: "Pedido", icon: FileText },
    { id: "historico", path: "/historico", label: "Histórico", icon: History },
    { id: "produtos", path: "/produtos", label: "Produtos", icon: Package },
    { id: "ajustes", path: "/ajustes", label: "Ajustes", icon: Settings },
  ];

  const getStatusColor = () => {
    if (printerStatus === "connected") return "green";
    if (printerStatus === "connecting") return "orange";
    return "red";
  };

  return (
    <>
      <Box
        as="header"
        className="app-header"
        w="full"
        h="16"
        bg="transparent"
        borderBottomWidth="0"
      >
        <Flex
          h="full"
          align="center"
          justify="space-between"
          className="app-page-gutter"
          px={{ base: "6", md: "8" }}
          maxW="7xl"
          mx="auto"
        >
          {/* Brand */}
          <HStack gap="4">
            <Center
              w="10"
              h="10"
              borderRadius="xl"
              bg="whiteAlpha.50"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              color="whiteAlpha.700"
            >
              <Printer size={20} strokeWidth={1.75} />
            </Center>
            <Text
              fontSize="lg"
              fontWeight="extrabold"
              letterSpacing="-0.03em"
              display={{ base: "none", sm: "block" }}
              color="white"
            >
              Bubina
            </Text>
          </HStack>

          {/* Navigation (Desktop) */}
          <HStack
            display={{ base: "none", md: "flex" }}
            bg="whiteAlpha.50"
            p="1"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            gap="1"
          >
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive =
                pathname === tab.path ||
                (tab.path === "/pedido" && pathname === "/");

              return (
                <Link href={tab.path} key={tab.id}>
                  <HStack
                    px="5"
                    py="2"
                    borderRadius="lg"
                    fontSize="xs"
                    fontWeight="semibold"
                    transition="all"
                    position="relative"
                    bg={isActive ? "whiteAlpha.100" : "transparent"}
                    color={isActive ? "blue.300" : "whiteAlpha.600"}
                    _hover={{ color: "white", bg: "whiteAlpha.80" }}
                    shadow={
                      isActive
                        ? "inset 0 1px 1px rgba(255,255,255,0.1)"
                        : "none"
                    }
                  >
                    <IconComp size={14} />
                    <Text>{tab.label}</Text>
                    {isActive && (
                      <Box
                        as={motion.div}
                        position="absolute"
                        bottom="-1"
                        left="2"
                        right="2"
                        h="0.5"
                        bg="blue.300/50"
                        filter="blur(1px)"
                        borderRadius="full"
                      />
                    )}
                  </HStack>
                </Link>
              );
            })}
          </HStack>

          {/* Actions */}
          <HStack gap="3" opacity={mounted ? 1 : 0} transition="opacity 0.2s">
            {/* User Menu */}
            {mounted && userEmail && (
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton
                    variant="subtle"
                    borderRadius="full"
                    bg="whiteAlpha.50"
                    color="whiteAlpha.600"
                    _hover={{ color: "white", borderColor: "blue.500/50" }}
                  >
                    <User size={16} />
                  </IconButton>
                </MenuTrigger>
                <MenuContent
                  className="app-panel"
                  p="2"
                  borderRadius="xl"
                  boxShadow="lg"
                >
                  <Box
                    p="4"
                    borderBottomWidth="1px"
                    borderColor="whiteAlpha.50"
                    mb="2"
                  >
                    <Text
                      fontSize="10px"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="whiteAlpha.400"
                      mb="1"
                    >
                      Sua Conta
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      truncate
                      maxW="200px"
                    >
                      {userEmail}
                    </Text>
                  </Box>
                  <MenuItem
                    value="logout"
                    onClick={handleLogout}
                    color="red.400"
                    borderRadius="lg"
                    _hover={{ bg: "red.500/10" }}
                    p="3"
                  >
                    <LogOut size={16} />
                    <Text fontSize="xs" fontWeight="semibold">
                      Sair da Conta
                    </Text>
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            )}

            {/* Printer Status Menu */}
            <MenuRoot>
              <MenuTrigger asChild>
                <IconButton
                  variant="subtle"
                  px="4"
                  py="2"
                  h="auto"
                  borderRadius="full"
                  bg="whiteAlpha.50"
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                  _hover={{ bg: "whiteAlpha.100", color: "white" }}
                >
                  <Box
                    as="span"
                    display="inline-flex"
                    alignItems="center"
                    gap="2"
                  >
                    <Circle
                      as="span"
                      size="2"
                      bg={mounted ? `${getStatusColor()}.500` : "gray.500"}
                    />
                    <Text
                      as="span"
                      fontSize="xs"
                      fontWeight="semibold"
                      display={{ base: "none", sm: "inline" }}
                    >
                      {!mounted
                        ? "Carregando..."
                        : printerStatus === "connected"
                          ? "Online"
                          : "Offline"}
                    </Text>
                    <Text
                      as="span"
                      fontSize="10px"
                      fontWeight="bold"
                      display={{ base: "inline", sm: "none" }}
                    >
                      {!mounted
                        ? "..."
                        : printerStatus === "connected"
                          ? "ON"
                          : "OFF"}
                    </Text>
                  </Box>
                </IconButton>
              </MenuTrigger>
              <MenuContent
                className="app-panel"
                p="5"
                borderRadius="2xl"
                minW="280px"
                boxShadow="lg"
              >
                <Flex justify="space-between" align="center" mb="6">
                  <Text
                    fontSize="10px"
                    fontWeight="bold"
                    color="whiteAlpha.400"
                    textTransform="uppercase"
                  >
                    Hardware
                  </Text>
                  <Badge
                    colorPalette={mounted ? getStatusColor() : "gray"}
                    variant="subtle"
                    textTransform="uppercase"
                    fontSize="9px"
                  >
                    {mounted ? printerStatus : "..."}
                  </Badge>
                </Flex>

                {mounted && printerStatus === "connected" && (
                  <HStack
                    p="4"
                    bg="whiteAlpha.50"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="whiteAlpha.50"
                    mb="5"
                  >
                    <Center
                      w="10"
                      h="10"
                      bg="blue.500/10"
                      borderRadius="lg"
                      color="blue.400"
                    >
                      <Printer size={16} />
                    </Center>
                    <VStack align="start" gap="0">
                      <Text
                        fontSize="10px"
                        color="whiteAlpha.400"
                        fontWeight="medium"
                        textTransform="uppercase"
                      >
                        Impressora Ativa
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {printerName || "Impressora Padrão"}
                      </Text>
                    </VStack>
                  </HStack>
                )}

                <Box pt="2">
                  {!mounted ? (
                    <Button w="full" disabled variant="subtle">
                      Carregando...
                    </Button>
                  ) : printerStatus === "connected" ? (
                    <Button
                      w="full"
                      variant="subtle"
                      colorPalette="red"
                      borderRadius="xl"
                      onClick={() => disconnectPrinter()}
                    >
                      <Unplug size={14} /> Desconectar
                    </Button>
                  ) : (
                    <Button
                      w="full"
                      colorPalette="blue"
                      borderRadius="xl"
                      onClick={() =>
                        handleConnect(authorizedDevice || undefined)
                      }
                      disabled={printerStatus === "connecting"}
                    >
                      <Bluetooth size={16} />{" "}
                      {authorizedDevice ? "Reconectar" : "Conectar"}
                    </Button>
                  )}
                </Box>
              </MenuContent>
            </MenuRoot>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Box
        as="nav"
        className="app-nav-mobile app-page-gutter"
        px={{ base: "6", md: "8" }}
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex="1000"
        display={{ base: "flex", md: "none" }}
        flexDirection="column"
      >
        <Flex h="16" w="full" align="center" justify="space-around">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive =
              pathname === tab.path ||
              (tab.path === "/pedido" && pathname === "/");

            return (
              <Link href={tab.path} key={tab.id} style={{ position: "relative" }}>
                <VStack
                  gap="0.5"
                  color={isActive ? "blue.300" : "whiteAlpha.500"}
                  transition="all"
                  _active={{ scale: 0.95 }}
                >
                  <IconComp size={isActive ? 20 : 18} />
                  <Text
                    fontSize="8px"
                    fontWeight="bold"
                    textTransform="uppercase"
                    opacity={isActive ? 1 : 0.4}
                  >
                    {tab.label}
                  </Text>
                  {isActive && (
                    <Box
                      as={motion.div}
                      position="absolute"
                      bottom="-2"
                      w="6"
                      h="0.5"
                      bg="blue.300/55"
                      filter="blur(1px)"
                      borderRadius="full"
                    />
                  )}
                </VStack>
              </Link>
            );
          })}
        </Flex>
        <Box
          aria-hidden
          flexShrink={0}
          style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        />
      </Box>
    </>
  );
}
