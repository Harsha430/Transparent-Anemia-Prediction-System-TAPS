/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [ 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif' ],
      },
      colors: {
        brand: {
          50: '#F8F5FA',
          100: '#F1E8F7',
            200: '#E3D1EF',
            300: '#CDA7E0',
            400: '#B47BCE',
            500: '#9B51BC',
            600: '#7A1FA0',
            700: '#63197F',
            800: '#4A125E',
            900: '#320B3E'
        },
        accent: {
          50: '#FEF2F3',
          100: '#FDE5E7',
          200: '#FACBD0',
          300: '#F6A5AD',
          400: '#F07484',
          500: '#E63946',
          600: '#C71D28',
          700: '#A01119',
          800: '#780C13',
          900: '#4F070C'
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A'
        },
        slate: {
          950: '#0B0E14'
        }
      },
      boxShadow: {
        'soft': '0 2px 4px -2px rgba(0,0,0,0.04), 0 4px 8px -1px rgba(0,0,0,0.04)',
        'elevated': '0 4px 8px -2px rgba(0,0,0,0.08), 0 12px 16px -4px rgba(0,0,0,0.06)',
        'glow': '0 0 0 2px rgba(123,31,160,0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at 30% 30%, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus']);
    }
  ],
}
