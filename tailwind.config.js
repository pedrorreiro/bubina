/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6eb0ff',
          hover: '#93c4ff',
          glow: 'rgba(110, 176, 255, 0.12)',
        },
        bg: '#07080d',
        surface: '#11141d',
        'surface-raised': '#181c28',
        'text-muted': '#9aa3b8',
        'text-dim': '#6b728c',
        green: '#3ecf8e',
        red: '#fb7185',
        yellow: '#fbbf5c',
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

export default tailwindConfig;
