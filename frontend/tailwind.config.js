/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0814',
        surface: {
          DEFAULT: '#120C24',
          card: '#18112E',
          border: '#2E1E54',
          hover: '#261947',
        },
        synth: {
          violet: '#C084FC',
          fuchsia: '#E879F9',
          neon: '#A855F7',
          sky: '#38BDF8',
          glow: 'rgba(192, 132, 252, 0.3)',
        },
        cyber: {
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          blue: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        heading: ['Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        'glow-synth': '0 0 25px -4px rgba(192, 132, 252, 0.4)',
        'glow-fuchsia': '0 0 25px -4px rgba(232, 121, 249, 0.35)',
        'glow-sky': '0 0 25px -4px rgba(56, 189, 248, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
