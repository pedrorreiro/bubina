import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Tema da aplicação: tokens globais, keyframes e CSS global (sem Tailwind).
 * globalCss usa `as any` porque a tipagem não cobre @media aninhado e pseudo-elementos.
 */
const appGlobalCss = {
  body: {
    bg: "#0a0b10",
    color: "#e4e8f0",
    minHeight: "100dvh",
    fontSize: "14px",
    lineHeight: 1.5,
    fontFamily: "body",
    letterSpacing: "-0.01em",
  },
  "@media (max-width: 767.98px)": {
    html: {
      scrollPaddingBottom:
        "calc(4rem + env(safe-area-inset-bottom, 0px) + 1.25rem)",
    },
  },
  "::-webkit-scrollbar": {
    width: "5px",
    height: "5px",
  },
  "::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "::-webkit-scrollbar-thumb": {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "999px",
  },
  "::-webkit-scrollbar-thumb:hover": {
    background: "rgba(255,255,255,0.1)",
  },
  "::selection": {
    backgroundColor: "color-mix(in srgb, #5b9cf5 25%, transparent)",
    color: "#e4e8f0",
  },
} as const;

const appConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: {
          value:
            "var(--font-pjs), Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
        },
      },
    },
    keyframes: {
      appReceiptFeed: {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(10px)" },
      },
      appReceiptShine: {
        "0%": { backgroundPosition: "-120% 0" },
        "100%": { backgroundPosition: "120% 0" },
      },
      appBarSlide: {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(280%)" },
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalCss: appGlobalCss as any,
});

export const system = createSystem(defaultConfig, appConfig);
