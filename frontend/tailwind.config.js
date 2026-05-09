export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f0f13',
        'bg-secondary': '#1a1a24',
        'bg-card': '#1e1e2e',
        'bg-hover': '#252535',
        border: '#2a2a3d',
        accent: '#6366f1',
        'accent-hover': '#818cf8',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
