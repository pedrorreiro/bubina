/** Padding horizontal com safe-area (equivalente ao antigo `.app-page-gutter`). */
export const safeGutterX = {
  pl: {
    base: "max(1.5rem, env(safe-area-inset-left, 0px))",
    md: "max(2rem, env(safe-area-inset-left, 0px))",
  },
  pr: {
    base: "max(1.5rem, env(safe-area-inset-right, 0px))",
    md: "max(2rem, env(safe-area-inset-right, 0px))",
  },
} as const;

/** Painéis / cards do app (equivalente ao antigo `.app-panel`). */
export const appPanelProps = {
  borderRadius: "2xl",
  borderWidth: "1px",
  borderColor: "rgba(255,255,255,0.06)",
  bg: "#14161e",
  boxShadow: "sm",
} as const;

/** Header fixo do app pago. */
export const appHeaderProps = {
  bg: "color-mix(in srgb, #14161e 85%, transparent)",
  backdropFilter: "blur(16px) saturate(1.1)",
  borderBottomWidth: "1px",
  borderColor: "rgba(255,255,255,0.06)",
  boxShadow:
    "0 1px 0 rgba(255,255,255,0.02), 0 1px 2px rgba(0,0,0,0.4)",
} as const;

/** Barra inferior mobile. */
export const appNavMobileProps = {
  bg: "#14161e",
  borderTopWidth: "1px",
  borderColor: "rgba(255,255,255,0.06)",
  boxShadow: "0 -4px 24px rgba(0,0,0,0.45)",
} as const;
