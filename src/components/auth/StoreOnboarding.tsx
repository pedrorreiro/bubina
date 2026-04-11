"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Store, Phone, ArrowRight, Printer } from "lucide-react";
import { maskPhone } from "@/lib/utils";
import {
  Box,
  Center,
  Heading,
  Text,
  VStack,
  Input as ChakraInput,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function StoreOnboarding() {
  const { setLoja, loja } = useApp();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;

    setIsSubmitting(true);
    try {
      await setLoja({
        ...loja,
        nome: nome.trim(),
        telefone: telefone.trim(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Center
      minH="screen"
      bg="#020305"
      p="6"
      position="relative"
      overflow="hidden"
    >
      {/* Background Orbs */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="60%"
        h="60%"
        bg="blue.500/10"
        borderRadius="full"
        filter="blur(140px)"
        pointerEvents="none"
        animation="pulse 8s infinite"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="50%"
        h="50%"
        bg="blue.500/5"
        borderRadius="full"
        filter="blur(140px)"
        pointerEvents="none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "512px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <VStack mb="12" gap="6">
          <Center
            w="16"
            h="16"
            borderRadius="3xl"
            bg="blue.500/10"
            border="1px solid"
            borderColor="blue.500/20"
            color="blue.400"
            shadow="2xl"
          >
            <Printer size={32} />
          </Center>
          <VStack gap="1">
            <Heading
              size="4xl"
              fontWeight="bold"
              letterSpacing="tight"
              color="white"
            >
              Bubina
            </Heading>
            <Text
              fontSize="10px"
              fontWeight="bold"
              color="whiteAlpha.400"
              textTransform="uppercase"
            >
              SaaS Operational Framework
            </Text>
          </VStack>
        </VStack>

        <Box
          className="app-panel"
          bg="transparent"
          borderWidth="0"
          shadow="none"
          p={{ base: "10", sm: "14" }}
        >
          <VStack mb="10" textAlign="center" gap="2">
            <Heading size="lg" fontWeight="bold" color="white">
              Configuração Inicial
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.500" fontWeight="medium">
              Preencha os dados do seu estabelecimento para começar.
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack gap="8" align="stretch">
              <Field label="Nome do Negócio">
                <Box position="relative" w="full">
                  <Box
                    position="absolute"
                    left="5"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="1"
                    color="whiteAlpha.400"
                  >
                    <Store size={14} />
                  </Box>
                  <ChakraInput
                    required
                    bg="blackAlpha.400"
                    borderWidth="1px"
                    borderColor="whiteAlpha.50"
                    borderRadius="2xl"
                    pl="12"
                    pr="5"
                    py="6"
                    fontSize="sm"
                    fontWeight="semibold"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Pizzaria Gourmet"
                    _focus={{
                      borderColor: "blue.400/50",
                      ring: "1px",
                      ringColor: "blue.400/20",
                    }}
                  />
                </Box>
              </Field>

              <Field label="Contato Comercial">
                <Box position="relative" w="full">
                  <Box
                    position="absolute"
                    left="5"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="1"
                    color="whiteAlpha.400"
                  >
                    <Phone size={14} />
                  </Box>
                  <ChakraInput
                    required
                    bg="blackAlpha.400"
                    borderWidth="1px"
                    borderColor="whiteAlpha.50"
                    borderRadius="2xl"
                    pl="12"
                    pr="5"
                    py="6"
                    fontSize="sm"
                    fontWeight="bold"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="(00) 12345-6789"
                    _focus={{
                      borderColor: "blue.400/50",
                      ring: "1px",
                      ringColor: "blue.400/20",
                    }}
                  />
                </Box>
              </Field>

              <Button
                type="submit"
                disabled={!nome.trim() || !telefone.trim()}
                colorPalette="blue"
                h="18"
                mt="4"
                borderRadius="2xl"
                fontSize="sm"
                fontWeight="bold"
                loading={isSubmitting}
                shadow="2xl"
              >
                <Text
                  as="span"
                  textTransform="uppercase"
                  display="inline-flex"
                  alignItems="center"
                  gap="4"
                >
                  Ativar Workspace
                  <ArrowRight size={20} />
                </Text>
              </Button>
            </VStack>
          </form>
        </Box>

        <Box mt="12" textAlign="center" opacity={0.6}>
          <Text
            fontSize="10px"
            fontWeight="bold"
            color="whiteAlpha.400"
            textTransform="uppercase"
            maxW="xs"
            mx="auto"
            lineHeight="relaxed"
          >
            Seus dados são criptografados e{" "}
            <Text as="span" color="white">
              sincronizados em tempo real
            </Text>
            .
          </Text>
        </Box>
      </motion.div>
    </Center>
  );
}
