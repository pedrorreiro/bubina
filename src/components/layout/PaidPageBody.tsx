"use client";

import { Flex } from "@chakra-ui/react";

/** Recuo horizontal igual ao Header (`px` 6 / 8) — Chakra garante que o padding aplique no corpo. */
export function PaidPageBody({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      direction="column"
      flex="1"
      minH="0"
      minW="0"
      w="full"
      px={{ base: 6, md: 8 }}
      pb={{ base: "var(--spacing-app-bottom-mobile)", md: 0 }}
    >
      {children}
    </Flex>
  );
}
