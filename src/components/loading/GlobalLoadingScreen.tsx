"use client";

import { Box, Flex, Text, VStack } from "@chakra-ui/react";

const BG = "#0a0b10";
const EDGE = "rgba(255,255,255,0.06)";
const PRIMARY = "#5b9cf5";
const SURFACE_RAISED = "#1a1d28";
const SURFACE_INSET = "#0d0e15";

export function GlobalLoadingScreen() {
  return (
    <Flex
      minH="100dvh"
      w="full"
      direction="column"
      align="center"
      justify="center"
      bg={BG}
      color="#e4e8f0"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        opacity={0.45}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${EDGE} 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        bgImage="radial-gradient(ellipse 80% 60% at 50% -10%, rgba(91,156,245,0.14), transparent 55%)"
      />
      <Box
        position="absolute"
        top="-100px"
        left="-80px"
        h="340px"
        w="340px"
        rounded="full"
        bg="rgba(91,156,245,0.14)"
        filter="blur(100px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-120px"
        right="-60px"
        h="380px"
        w="380px"
        rounded="full"
        bg="rgba(91,156,245,0.08)"
        filter="blur(110px)"
        pointerEvents="none"
      />

      <VStack position="relative" zIndex={1} w="full" maxW="sm" gap="10" px="6">
        <Flex direction="column" align="center" w="full" pt="4">
          <Flex justify="center" position="relative">
            <Box
              position="relative"
              zIndex={1}
              w="200px"
              roundedTop="2xl"
              borderWidth="1px"
              borderBottomWidth={0}
              borderColor={EDGE}
              bg={SURFACE_RAISED}
              px="4"
              pb="3"
              pt="4"
              boxShadow="0 16px 48px rgba(0,0,0,0.35)"
            >
              <Box
                mx="auto"
                mb="3"
                display="flex"
                h="2"
                w="72%"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                bg="rgba(0,0,0,0.35)"
                boxShadow="inset 0 1px 2px rgba(0,0,0,0.4)"
              />
              <Box mx="auto" h="1" w="88%" rounded="full" bg={`${PRIMARY}40`} />

              <Flex justify="center" position="relative" mt={0} mb="-1">
                <Box
                  animation="appReceiptFeed 2.4s ease-in-out infinite"
                  position="relative"
                  w="78%"
                  transformOrigin="top"
                >
                  <Box
                    position="relative"
                    overflow="hidden"
                    roundedBottom="lg"
                    borderWidth="1px"
                    borderTopWidth={0}
                    borderColor="rgba(0,0,0,0.1)"
                    bg="#eceae4"
                    px="3"
                    pb="5"
                    pt="3"
                    boxShadow="0 8px 24px rgba(0,0,0,0.2)"
                  >
                    <Box
                      pointerEvents="none"
                      position="absolute"
                      inset={0}
                      opacity={0.9}
                      animation="appReceiptShine 2.8s ease-in-out infinite"
                      bgGradient="linear(105deg, transparent 0%, transparent 40%, rgba(91,156,245,0.22) 50%, transparent 60%, transparent 100%)"
                      backgroundSize="220% 100%"
                    />
                    <VStack gap="2" position="relative" align="stretch">
                      <Box mx="auto" h="1" w="55%" rounded="full" bg="rgba(0,0,0,0.15)" />
                      <Box h="1" w="full" rounded="full" bg="rgba(0,0,0,0.1)" />
                      <Box h="1" w="92%" rounded="full" bg="rgba(0,0,0,0.1)" />
                      <Box h="1" w="78%" rounded="full" bg="rgba(0,0,0,0.1)" />
                      <Box h="1" w="88%" rounded="full" bg="rgba(0,0,0,0.1)" />
                      <Box pt="1">
                        <Box
                          mx="auto"
                          h="6"
                          w="70%"
                          rounded="md"
                          borderWidth="1px"
                          borderStyle="dashed"
                          borderColor="rgba(0,0,0,0.15)"
                          bg="rgba(0,0,0,0.05)"
                        />
                      </Box>
                    </VStack>
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Flex>

          <Box
            position="relative"
            zIndex={0}
            mt="-1"
            h="3"
            w="220px"
            maxW="full"
            rounded="full"
            bgGradient="linear(to-b, #14161e, #0a0b10)"
            boxShadow="inset 0 1px 2px rgba(0,0,0,0.4)"
            borderWidth="1px"
            borderColor={EDGE}
            aria-hidden
          />
        </Flex>

        <VStack gap="2" textAlign="center">
          <Text fontSize="sm" fontWeight="medium" lineHeight="normal" color="#8f98ad">
            Carregando
          </Text>
          <Box
            h="1"
            w="40"
            flexShrink={0}
            overflow="hidden"
            rounded="full"
            bg={SURFACE_INSET}
            borderWidth="1px"
            borderColor={EDGE}
          >
            <Box
              h="full"
              w="33.333%"
              rounded="full"
              bgGradient={`linear(to-r, ${PRIMARY}33, ${PRIMARY}, ${PRIMARY}99)`}
              animation="appBarSlide 1.2s ease-in-out infinite"
            />
          </Box>
        </VStack>
      </VStack>
    </Flex>
  );
}
