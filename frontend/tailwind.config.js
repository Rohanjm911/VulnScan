/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        surface: {
          DEFAULT: '#111827',
          card: '#111827',
          border: '#1f2937',
          hover: '#1f2937',
        },
        synth: {
          violet: '#60a5fa',
          fuchsia: '#3b82f6',
          neon: '#2563eb',
          sky: '#38bdf8',
          glow: 'transparent',
        },
        cyber: {
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        heading: ['Inter', 'sans-serif']
      },
      boxShadow: {
        // Flat design - zero neon glow
        'glow-synth': 'none',
        'glow-fuchsia': 'none',
        'glow-sky': 'none',
        'glow-red': 'none',
        'glow-electric': 'none',
      }
    },
  },
  plugins: [],
}
