/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        accent: '#3B82F6',
        bg: {
          main: '#0F172A',
          secondary: '#1E293B',
        },
        text: {
          main: '#F8FAFC',
          muted: '#94A3B8',
        },
        border: {
          glass: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backgroundImage: {
        'btn-gradient': 'linear-gradient(135deg, #4F46E5, #3B82F6)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'Poppins', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(79, 70, 229, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        }
      },
      transitionTimingFunction: {
        'modern': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}