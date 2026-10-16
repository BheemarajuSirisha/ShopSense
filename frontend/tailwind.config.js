/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Plum Magenta Blush Theme
        plum: {
          dark: '#4A0D3F',
          DEFAULT: '#61104C',
          base: '#7A1259',
          light: '#911769',
        },
        magenta: {
          dark: '#7A1259',
          DEFAULT: '#B5179E',
          hover: '#C724B0',
          light: '#E14DB0',
        },
        pink: {
          accent: '#E14DB0',
          light: '#F8B4D9',
          tint: '#FCE4F1',
          border: '#F6D3E6',
        },
        blush: {
          50: '#FFF5FA',
          100: '#FDEFF6',
          200: '#FBE4F0',
          300: '#F6D3E6',
          DEFAULT: '#FDEFF6',
        },
        primary: {
          50: '#FCE4F1',
          100: '#F8B4D9',
          200: '#F084C5',
          300: '#E14DB0',
          400: '#D029A7',
          500: '#B5179E', // Primary Magenta #B5179E
          600: '#9B1487',
          700: '#7A1259', // Primary Dark #7A1259
          800: '#61104C',
          900: '#4A0D3F', // Deep Plum #4A0D3F
          DEFAULT: '#B5179E',
          dark: '#7A1259',
          accent: '#E14DB0',
          light: '#F8B4D9',
          tint: '#FCE4F1',
        },
        // Backward-compatible aliases mapped to Plum Magenta Blush
        mauve: {
          50: '#FCE4F1',
          100: '#F8B4D9',
          200: '#F084C5',
          300: '#E14DB0',
          400: '#D029A7',
          500: '#B5179E',
          600: '#9B1487',
          700: '#7A1259',
          800: '#61104C',
          900: '#4A0D3F',
        },
        maroon: {
          50: '#FCE4F1',
          100: '#F8B4D9',
          200: '#F084C5',
          300: '#E14DB0',
          400: '#D029A7',
          500: '#B5179E',
          600: '#9B1487',
          700: '#7A1259',
          800: '#61104C',
          900: '#4A0D3F',
        },
        gold: {
          50: '#FFF9E6',
          100: '#FFF0B8',
          200: '#FFE28A',
          300: '#FFD45C',
          400: '#E14DB0',
          500: '#B5179E',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FDEFF6',
          200: '#FFFFFF',
          300: '#F6D3E6',
        },
        brand: {
          heading: '#3B0A33',
          body: '#6B4A62',
          muted: '#A98AA0',
          text: '#3B0A33',
        },
      },
      textColor: {
        heading: '#3B0A33',
        body: '#6B4A62',
        muted: '#A98AA0',
      },
      backgroundColor: {
        page: '#FDEFF6',
        card: '#FFFFFF',
      },
      borderColor: {
        plum: '#F6D3E6',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Poppins', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'plum': '0 8px 24px rgba(181, 23, 158, 0.08)',
        'plum-hover': '0 14px 30px rgba(181, 23, 158, 0.14)',
        'luxe': '0 8px 24px rgba(181, 23, 158, 0.08)',
        'luxe-hover': '0 14px 30px rgba(181, 23, 158, 0.14)',
        'magenta-glow': '0 0 20px rgba(181, 23, 158, 0.35)',
        'pink-glow': '0 0 15px rgba(225, 77, 176, 0.30)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
