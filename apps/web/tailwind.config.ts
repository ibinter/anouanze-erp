import type { Config } from 'tailwindcss';

const config: Config = {
  // Mode sombre piloté par la classe `dark` sur <html> (cf. ThemeProvider)
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique ANOUANZÊ ERP
        primary: {
          DEFAULT: '#146C43', // évite les classes `bg-primary`/`text-primary` sans couleur
          50:  '#f0faf4',
          100: '#d8f3e3',
          200: '#b3e6c9',
          300: '#7dd3a8',
          400: '#44b87f',
          500: '#2e9e4f',
          600: '#146C43',   // Couleur principale
          700: '#115a38',
          800: '#0f4a2f',
          900: '#0c3d27',
        },
        accent: {
          DEFAULT: '#f28c25',
          50:  '#fff8f0',
          100: '#ffecd3',
          200: '#ffd5a3',
          300: '#ffb768',
          400: '#f28c25',   // Couleur accent
          500: '#e07510',
          600: '#c4610a',
          700: '#a34f09',
          800: '#85400c',
          900: '#6e360f',
        },
        neutral: {
          50:  '#f7f7f7',
          100: '#ededed',
          200: '#d9d9d9',
          300: '#c4c4c4',
          400: '#9d9d9d',
          500: '#7b7b7b',
          600: '#4a4a4a',
          700: '#353535',
          800: '#1a1a1a',
          900: '#0d0d0d',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', '"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
