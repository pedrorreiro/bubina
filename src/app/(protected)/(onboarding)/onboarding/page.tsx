"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Store, Phone, ArrowRight, Printer, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";

const BG = "#0a0b10";
const BORDER = "rgba(255,255,255,0.06)";
const PRIMARY = "#5b9cf5";
const DIM = "#5c6478";

export default function OnboardingPage() {
  const { setLoja, loja } = useApp();
  const router = useRouter();
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
      router.push("/pedido");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Flex
      minH="100dvh"
      bg={BG}
      align="center"
      justify="center"
      py={{ base: "8", sm: "12" }}
      position="relative"
      overflow="hidden"
      pl={{ base: "max(1.5rem, env(safe-area-inset-left, 0px))", md: "max(2rem, env(safe-area-inset-left, 0px))" }}
      pr={{ base: "max(1.5rem, env(safe-area-inset-right, 0px))", md: "max(2rem, env(safe-area-inset-right, 0px))" }}
    >
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="40%"
        h="40%"
        bg={`${PRIMARY}33`}
        rounded="full"
        filter="blur(120px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="40%"
        h="40%"
        bg={`${PRIMARY}1a`}
        rounded="full"
        filter="blur(120px)"
        pointerEvents="none"
      />

      <Box w="full" maxW="lg" position="relative" zIndex={1}>
        <VStack mb="10" align="center">
          <Box
            w="16"
            h="16"
            bg="#14161e"
            borderWidth="1px"
            borderColor={BORDER}
            rounded="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb="6"
            boxShadow="2xl"
            position="relative"
            overflow="hidden"
          >
            <Printer size={32} color={PRIMARY} style={{ position: "relative", zIndex: 1 }} />
          </Box>
          <Heading
            as="h1"
            fontSize="3xl"
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            letterSpacing="tighter"
            mb="2"
            textAlign="center"
          >
            Bem-vindo ao{" "}
            <Text as="span" color={PRIMARY} fontStyle="italic">
              Bubina
            </Text>
          </Heading>
          <Text
            color={DIM}
            fontWeight="bold"
            textAlign="center"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.2em"
          >
            Configuração do seu negócio
          </Text>
        </VStack>

        <Box
          rounded="xl"
          p={{ base: "8", sm: "12" }}
          borderWidth="1px"
          borderColor={`${PRIMARY}33`}
          bg="#14161e"
          boxShadow="0 30px 60px -15px rgba(0,0,0,0.5)"
        >
          <form onSubmit={handleSubmit}>
            <VStack gap="8" align="stretch">
              <Field
                label={
                  <Flex align="center" gap="2" fontSize="10px" fontWeight="black" color={DIM} textTransform="uppercase" letterSpacing="0.3em">
                    <Store size={14} color={PRIMARY} />
                    Nome do estabelecimento
                  </Flex>
                }
              >
                <Input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Pizzaria do Vale"
                  w="full"
                  bg={BG}
                  borderWidth="1px"
                  borderColor={BORDER}
                  rounded="xl"
                  px="5"
                  py="4"
                  fontSize="sm"
                  fontWeight="bold"
                  color="white"
                  _placeholder={{ color: "rgba(92,100,120,0.35)" }}
                  _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}33` }}
                />
              </Field>

              <Field
                label={
                  <Flex align="center" gap="2" fontSize="10px" fontWeight="black" color={DIM} textTransform="uppercase" letterSpacing="0.3em">
                    <Phone size={14} color={PRIMARY} />
                    Telefone de contato
                  </Flex>
                }
              >
                <Input
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  w="full"
                  bg={BG}
                  borderWidth="1px"
                  borderColor={BORDER}
                  rounded="xl"
                  px="5"
                  py="4"
                  fontSize="sm"
                  fontWeight="bold"
                  color="white"
                  _placeholder={{ color: "rgba(92,100,120,0.35)" }}
                  _focus={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}33` }}
                />
              </Field>

              <VStack gap="4" align="stretch" pt="4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !nome.trim() || !telefone.trim()}
                  w="full"
                  h="16"
                  rounded="xl"
                  bg={PRIMARY}
                  color="white"
                  fontSize="xs"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="0.3em"
                  boxShadow="xl"
                  gap="4"
                  _hover={{ filter: "brightness(1.08)" }}
                  _disabled={{ opacity: 0.5 }}
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      Começar a vender
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleLogout}
                  w="full"
                  h="12"
                  fontSize="10px"
                  fontWeight="black"
                  color={DIM}
                  textTransform="uppercase"
                  letterSpacing="widest"
                  _hover={{ color: "white" }}
                >
                  <LogOut size={14} style={{ marginRight: "0.5rem" }} />
                  Sair da conta
                </Button>
              </VStack>
            </VStack>
          </form>
        </Box>

        <Text
          mt="10"
          textAlign="center"
          fontSize="9px"
          fontWeight="black"
          color={DIM}
          textTransform="uppercase"
          letterSpacing="widest"
          lineHeight="relaxed"
        >
          Ao prosseguir, você concorda que o <Text as="span" color="white">Bubina</Text> processe seus dados com
          segurança na nuvem.
        </Text>
      </Box>
    </Flex>
  );
}

