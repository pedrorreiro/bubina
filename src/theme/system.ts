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
  "input, textarea, select": {
    background: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: "#e8ecf5",
  },
  "input::placeholder, textarea::placeholder": {
    color: "rgba(232, 236, 245, 0.55)",
  },
  "@media (max-width: 767.98px)": {
    html: {
      scrollPaddingBottom:
        "calc(4rem + env(safe-area-inset-bottom, 0px) + 1.25rem)",
    },
  },
  "*": {
    scrollbarWidth: "auto",
    scrollbarColor: "rgba(158, 170, 194, 0.55) rgba(255, 255, 255, 0.04)",
  },
  "::-webkit-scrollbar": {
    width: "10px",
    height: "10px",
  },
  "::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.04)",
  },
  "::-webkit-scrollbar-thumb": {
    background: "rgba(158, 170, 194, 0.55)",
    borderRadius: "10px",
  },
  "::-webkit-scrollbar-thumb:hover": {
    background: "rgba(177, 190, 216, 0.75)",
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
