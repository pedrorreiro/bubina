"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { system } from "@/theme/system"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import EmotionRegistry from "./registry"

export function Provider(props: ColorModeProviderProps) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        <ColorModeProvider {...props} forcedTheme="dark" />
      </ChakraProvider>
    </EmotionRegistry>
  )
}
