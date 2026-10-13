/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f0f1a',
          800: '#141424',
          700: '#1a1a2e',
          600: '#23233c',
          500: '#2e2e4d',
        },
        brand: {
          purple: '#7c3aed',
          'purple-light': '#8b5cf6',
          'purple-dark': '#6d28d9',
          pink: '#ec4899',
          'pink-light': '#f472b6',
          'pink-dark': '#db2777',
          rose: '#f43f5e',
          indigo: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-fashion': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1a2e 0%, #111122 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        'gradient-accent': 'linear-gradient(90deg, #7c3aed 0%, #ec4899 50%, #f43f5e 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.35)',
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.35)',
        'fashion': '0 10px 30px -10px rgba(26, 26, 46, 0.08), 0 4px 6px -2px rgba(26, 26, 46, 0.04)',
        'fashion-hover': '0 20px 35px -12px rgba(124, 58, 237, 0.18), 0 8px 12px -4px rgba(26, 26, 46, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
