"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Box, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

const BG = "#0a0b10";
const SURFACE = "#14161e";
const RAISED = "#1a1d28";
const BORDER = "rgba(255,255,255,0.06)";
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <Center minH="100vh" bg={BG}>
        <Spinner size="lg" color="#5b9cf5" borderWidth="4px" />
      </Center>
    );
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={BG}
      px="6"
      pb="20"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        w="24rem"
        h="24rem"
        bg="rgba(91,156,245,0.1)"
        rounded="full"
        filter="blur(100px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-100px"
        right="-100px"
        w="24rem"
        h="24rem"
        bg="rgba(91,156,245,0.05)"
        rounded="full"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <Box
        w="full"
        maxW="md"
        bg={SURFACE}
        borderWidth="1px"
        borderColor={BORDER}
        rounded="2xl"
        p="8"
        zIndex={1}
        boxShadow="2xl"
        position="relative"
      >
        <Flex direction="column" align="center" mb="8">
          <Flex
            w="16"
            h="16"
            align="center"
            justify="center"
            rounded="2xl"
            bg={RAISED}
            borderWidth="1px"
            borderColor={BORDER}
            boxShadow="inset 0 2px 8px rgba(0,0,0,0.3)"
            mb="4"
          >
            <Text fontSize="2xl" fontWeight="black" color="white">
              B
            </Text>
          </Flex>
          <Heading
            as="h1"
            fontSize="3xl"
            fontWeight="black"
            color="white"
            letterSpacing="tighter"
            textTransform="uppercase"
          >
            Bubina
          </Heading>
          <Text
            fontSize="11px"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.2em"
            color="#5c6478"
            mt="2"
          >
            Ponto de venda em nuvem
          </Text>
        </Flex>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#22c55e",
                  brandAccent: "#16a34a",
                  inputBackground: "#1A1D24",
                  inputText: "white",
                  inputBorder: "#232731",
                  messageText: "#A1A1AA",
                },
                space: {
                  buttonPadding: "12px 20px",
                  inputPadding: "14px 16px",
                },
                radii: {
                  borderRadiusButton: "8px",
                  buttonBorderRadius: "8px",
                  inputBorderRadius: "8px",
                },
              },
            },
            className: {
              container: "",
              button: "",
              input: "",
              label: "",
            },
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-mail",
                password_label: "Senha",
                email_input_placeholder: "Seu e-mail",
                password_input_placeholder: "Sua senha",
                button_label: "Entrar",
                loading_button_label: "Entrando...",
                social_provider_text: "Entrar com {{provider}}",
                link_text: "Já tem uma conta? Entre",
              },
              sign_up: {
                email_label: "E-mail",
                password_label: "Senha",
                email_input_placeholder: "Seu e-mail",
                password_input_placeholder: "Crie uma senha",
                button_label: "Criar conta",
                loading_button_label: "Criando conta...",
                social_provider_text: "Cadastrar com {{provider}}",
                link_text: "Não tem uma conta? Cadastre-se",
              },
            },
          }}
        />
      </Box>
    </Flex>
  );
}
