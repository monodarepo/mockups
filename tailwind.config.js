/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superfícies
        app: '#F6F8FB',
        card: '#FFFFFF',
        line: '#E6EBF2',
        // Texto
        ink: '#0F172A',
        muted: '#64748B',
        // Primária
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#EFF6FF',
          strong: '#1E40AF',
        },
        // Semânticas
        success: { DEFAULT: '#16A34A', soft: '#E7F6EC', strong: '#15803D' },
        warning: { DEFAULT: '#F59E0B', soft: '#FEF3E2', strong: '#B45309' },
        danger: { DEFAULT: '#DC2626', soft: '#FDEBEB', strong: '#B91C1C' },
        info: { DEFAULT: '#0EA5E9', soft: '#E6F6FE', strong: '#0369A1' },
        setup: { DEFAULT: '#F97316', soft: '#FFF1E7', strong: '#C2410C' },
        clean: { DEFAULT: '#8B5CF6', soft: '#F2ECFE', strong: '#6D28D9' },
        neutral: { DEFAULT: '#64748B', soft: '#F1F5F9', strong: '#475569' },
      },
      borderColor: {
        DEFAULT: '#E6EBF2',
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06)',
        pop: '0 8px 24px rgba(16,24,40,.10)',
        pill: '0 1px 2px rgba(37,99,235,.24)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Escala do design system
        caption: ['12px', { lineHeight: '16px' }],
        'body-sm': ['13px', { lineHeight: '18px' }],
        body: ['14px', { lineHeight: '20px' }],
        'card-title': ['15px', { lineHeight: '20px' }],
        title: ['22px', { lineHeight: '28px' }],
        kpi: ['28px', { lineHeight: '34px' }],
      },
      transitionDuration: {
        DEFAULT: '160ms',
        150: '150ms',
        200: '200ms',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.45', transform: 'scale(.85)' },
        },
        'pulse-critical': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,38,38,.35)' },
          '70%': { boxShadow: '0 0 0 6px rgba(220,38,38,0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        flow: {
          to: { strokeDashoffset: '-16' },
        },
        // Pisca 2x e estabiliza no primário suave; a página remove a classe aos 3s.
        destaque: {
          '0%, 40%, 80%': { backgroundColor: 'transparent' },
          '20%, 60%, 100%': { backgroundColor: 'rgba(37,99,235,.14)' },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 1.8s ease-in-out infinite',
        'pulse-critical': 'pulse-critical 2s ease-out infinite',
        'toast-in': 'toast-in 180ms ease-out',
        flow: 'flow 1.2s linear infinite',
        destaque: 'destaque 1.2s ease-out',
      },
    },
  },
  plugins: [],
}
