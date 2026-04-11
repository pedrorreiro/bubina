"use client";

import { Box } from "@chakra-ui/react";

/** Envoltório do app pago: fundo + brilho radial (ex-`app-shell-glow`). */
export function PaidLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      position="relative"
      display="flex"
      minH="100dvh"
      flexDirection="column"
      bg="#0a0b10"
    >
      <Box
        aria-hidden
        position="fixed"
        inset="0"
        zIndex={-10}
        pointerEvents="none"
        bgImage="radial-gradient(ellipse 80% 50% at 50% -5%, rgba(91, 156, 245, 0.07), transparent 50%)"
      />
      {children}
    </Box>
  );
}
