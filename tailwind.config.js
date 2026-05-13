/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFB4B4',
          400: '#FF9999',
          500: '#FF7070',
          600: '#E54D4D',
          700: '#B32E2E',
          DEFAULT: '#FF9999',
        },
        accent: { DEFAULT: '#3B82F6', bg: '#EFF6FF' },
        neutral: {
          50:  '#FCFAFA',
          100: '#F5F1F1',
          200: '#E8E2E2',
          300: '#D0C8C8',
          500: '#6B6464',
          700: '#3D3838',
          900: '#1F1C1C',
        },
        success: { DEFAULT: '#22C55E', bg: '#ECFDF5' },
        warning: { DEFAULT: '#FACC15', bg: '#FFFBEB' },
        danger:  { DEFAULT: '#EF4444', bg: '#FEF2F2' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption':  ['0.875rem', { lineHeight: '1.4',  fontWeight: '500' }],
        'overline': ['0.75rem',  { lineHeight: '1.2',  letterSpacing: '0.08em', fontWeight: '600' }],
        'base':     ['1rem',     { lineHeight: '1.6' }],
        'body-lg':  ['1.125rem', { lineHeight: '1.6' }],
        'h3':       ['1.25rem',  { lineHeight: '1.4',  letterSpacing: '-0.01em',  fontWeight: '600' }],
        'h2':       ['1.5rem',   { lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '600' }],
        'h1':       ['2rem',     { lineHeight: '1.2',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        'display':  ['3rem',     { lineHeight: '1.1',  letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      borderRadius: {
        'button': '0.625rem',
        'card':   '1rem',
        'hero':   '3rem',
      },
      boxShadow: {
        'card':   '0 4px 12px rgba(0, 0, 0, 0.06)',
        'raised': '0 8px 24px rgba(255, 153, 153, 0.18)',
        'hero':   '0 12px 32px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        'tap': '3rem',
      },
      maxWidth: {
        'reading':            '65ch',
        'dashboard-content':  'calc(100% - 15rem)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
