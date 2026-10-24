import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: '#F2F5F3',          // Soft alabaster canvas
          surface: '#F8FAF9',
          border: 'rgba(255, 255, 255, 0.7)',
        },
        emerald: {
          950: '#061A14',
          900: '#0D3B2E',         // Deep hero and staff dashboard tone
          800: '#115E46',         // Brand primary button tone
          700: '#167558',
          600: '#1E9470',
          100: '#E1EFEA',
        },
        gold: {
          500: '#D99B26',         // Solar prayer icons & pending badges
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        urdu: ['var(--font-noto-urdu)', 'serif'],
      },
      boxShadow: {
        // Claymorphism: Elevated 3D Pill & Card Shadows
        'clay-card': '8px 8px 18px rgba(163, 177, 170, 0.4), -8px -8px 18px rgba(255, 255, 255, 0.95), inset 2px 2px 3px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(163, 177, 170, 0.2)',
        'clay-btn': '0 8px 16px -2px rgba(17, 94, 70, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.35), inset 0 -3px 4px rgba(0, 0, 0, 0.25)',
        'clay-pill': '4px 4px 10px rgba(163, 177, 170, 0.35), -4px -4px 10px rgba(255, 255, 255, 0.9)',
        // Neumorphism: Recessed Inputs
        'neu-inset': 'inset 4px 4px 8px #d5ded9, inset -4px -4px 8px #ffffff',
        // Dark Emerald Neumorphism (Staff Dashboard)
        'neu-dark': '6px 6px 14px #08241c, -6px -6px 14px #125240, inset 1px 1px 2px rgba(255, 255, 255, 0.1)',
        'neu-dark-inset': 'inset 3px 3px 6px #09261e, inset -3px -3px 6px #135844',
      },
    },
  },
  plugins: [],
};

export default config;