"use client";

import { Box } from "@chakra-ui/react";
import { PaidPageBody } from "@/components/layout/PaidPageBody";

export function PaidMainColumn({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="main"
      flex="1"
      display="flex"
      flexDirection="column"
      minW={0}
      w="full"
      maxW="7xl"
      mx="auto"
      alignSelf="center"
      pt={{ base: "6", md: "8" }}
      pb={{ base: 0, md: "8" }}
    >
      <PaidPageBody>{children}</PaidPageBody>
    </Box>
  );
}
