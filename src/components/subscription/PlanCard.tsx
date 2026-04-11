"use client";

import { Check, ArrowRight } from "lucide-react";
import { Box, Button, Flex, Heading, Spinner, Text, VStack } from "@chakra-ui/react";

const PRIMARY = "#5b9cf5";
const MUTED = "#8f98ad";
const DIM = "#5c6478";

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
  onSelect: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PlanCard({
  title,
  price,
  period,
  description,
  features,
  badge,
  highlighted = false,
  onSelect,
  loading = false,
  disabled = false,
}: PlanCardProps) {
  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      rounded="3xl"
      borderWidth="1px"
      transition="all 0.5s"
      p={{ base: "6", sm: "10" }}
      borderColor={highlighted ? `${PRIMARY}4d` : "rgba(255,255,255,0.05)"}
      bg={highlighted ? "rgba(91,156,245,0.05)" : "rgba(20,22,30,0.7)"}
      backdropFilter="blur(14px)"
      boxShadow={
        highlighted
          ? "0 20px 60px -15px rgba(59,130,246,0.15), 0 0 0 1px rgba(91,156,245,0.2)"
          : undefined
      }
      transform={{ md: highlighted ? "scale(1.02)" : undefined }}
      _hover={{
        borderColor: highlighted ? `${PRIMARY}66` : "rgba(255,255,255,0.1)",
      }}
    >
      {highlighted && (
        <Box
          position="absolute"
          top={0}
          right={0}
          w="40"
          h="40"
          bg={`${PRIMARY}1a`}
          rounded="full"
          filter="blur(80px)"
          mr="-20"
          mt="-20"
          pointerEvents="none"
        />
      )}

      {badge && (
        <Box position="absolute" top="6" right="6">
          <Text
            as="span"
            display="inline-block"
            px="3"
            py="1"
            bg={`${PRIMARY}33`}
            borderWidth="1px"
            borderColor={`${PRIMARY}4d`}
            color={PRIMARY}
            fontSize="9px"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.2em"
            rounded="lg"
            backdropFilter="blur(12px)"
          >
            {badge}
          </Text>
        </Box>
      )}

      <Box mb="8">
        <Heading
          as="h3"
          fontSize="11px"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="0.3em"
          mb="4"
          color={highlighted ? PRIMARY : DIM}
        >
          {title}
        </Heading>
        <Flex align="baseline" gap="1.5">
          <Text fontSize="4xl" fontWeight="bold" color="white" letterSpacing="tight">
            {price}
          </Text>
          <Text fontSize="sm" fontWeight="semibold" color={DIM}>
            {period}
          </Text>
        </Flex>
        <Text fontSize="xs" color={MUTED} mt="3" fontWeight="medium" lineHeight="relaxed" opacity={0.8}>
          {description}
        </Text>
      </Box>

      <Box w="full" h="1px" bg="rgba(255,255,255,0.05)" mb="8" />

      <VStack gap="4" mb="10" flex="1" align="stretch">
        {features.map((feature, i) => (
          <Flex key={i} align="center" gap="3.5">
            <Flex
              w="5"
              h="5"
              rounded="full"
              align="center"
              justify="center"
              borderWidth="1px"
              transition="colors 0.2s"
              borderColor={highlighted ? `${PRIMARY}33` : "rgba(255,255,255,0.05)"}
              bg={highlighted ? `${PRIMARY}1a` : "rgba(255,255,255,0.05)"}
              color={highlighted ? PRIMARY : DIM}
            >
              <Check size={10} strokeWidth={3} />
            </Flex>
            <Text fontSize="13px" fontWeight="semibold" color={MUTED}>
              {feature}
            </Text>
          </Flex>
        ))}
      </VStack>

      <Button
        w="full"
        h="14"
        rounded="2xl"
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="widest"
        onClick={onSelect}
        disabled={disabled || loading}
        gap="2.5"
        _active={{ transform: "scale(0.98)" }}
        opacity={disabled || loading ? 0.3 : 1}
        cursor={disabled || loading ? "not-allowed" : "pointer"}
        bg={highlighted ? PRIMARY : "rgba(255,255,255,0.05)"}
        color="white"
        borderWidth={highlighted ? 0 : "1px"}
        borderColor="rgba(255,255,255,0.1)"
        boxShadow={highlighted ? "0 12px 40px rgba(59,130,246,0.2)" : undefined}
        _hover={
          highlighted
            ? { filter: "brightness(1.08)" }
            : { bg: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }
        }
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            Processando
          </>
        ) : (
          <>
            Assinar agora
            {highlighted ? (
              <ArrowRight size={16} style={{ opacity: 0.4 }} />
            ) : (
              <Box display={{ base: "none", md: "block" }}>
                <ArrowRight size={16} style={{ opacity: 0.4 }} />
              </Box>
            )}
          </>
        )}
      </Button>
    </Box>
  );
}
