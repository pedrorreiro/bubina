/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.2)',
        },
        bg: '#050505',
        surface: '#111111',
        'surface-raised': '#1a1a1a',
        'text-muted': '#94a3b8',
        'text-dim': '#64748b',
        green: '#10b981',
        red: '#ef4444',
        yellow: '#f59e0b',
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        lg: '20px',
      },
      backdropBlur: {
        glass: '12px',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 0%, #1a1b26 0%, #050505 70%)',
      },
    },
  },
  plugins: [],
};
