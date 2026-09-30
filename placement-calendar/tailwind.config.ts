import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Accent — MongoDB design tokens
        'brand-green':       '#00ed64',
        'brand-green-dark':  '#00684a',
        'brand-green-mid':   '#00a35c',
        'brand-green-soft':  '#c3f0d2',
        'brand-teal-deep':   '#001e2b',
        'brand-teal':        '#003d4f',
        'brand-teal-mid':    '#00684a',
        'accent-purple':     '#7b3ff2',
        'accent-orange':     '#fa6e39',
        'accent-pink':       '#f06bb8',
        'accent-blue':       '#3d4f9f',
        // Semantic
        'warning-bg':        '#fff8e0',
        'warning-text':      '#946f3f',
        // Status (for drives)
        'status-available':  '#00ed64',
        'status-tentative':  '#f59e0b',
        'status-fixed':      '#ef4444',
        // Surface
        canvas:              '#ffffff',
        'canvas-dark':       '#001e2b',
        surface:             '#f9fbfa',
        'surface-soft':      '#f4f7f6',
        'surface-feature':   '#e3fcef',
        hairline:            '#e1e5e8',
        'hairline-soft':     '#eceff1',
        'hairline-strong':   '#c1ccd6',
        'hairline-dark':     '#1c2d38',
        // Text
        ink:                 '#001e2b',
        charcoal:            '#1c2d38',
        slate:               '#3d4f5b',
        steel:               '#5c6c7a',
        stone:               '#7c8c9a',
        muted:               '#a8b3bc',
        'on-dark':           '#ffffff',
        'on-dark-muted':     '#a8b3bc',
        'on-primary':        '#001e2b',
        // Primary alias
        primary:             '#00ed64',
        'primary-deep':      '#00b545',
        'primary-pressed':   '#008c34',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Source Code Pro', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs:   '4px',
        sm:   '6px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        xxl:  '24px',
        full: '9999px',
      },
      spacing: {
        xxs:        '4px',
        xs:         '8px',
        sm:         '12px',
        md:         '16px',
        lg:         '20px',
        xl:         '24px',
        xxl:        '32px',
        xxxl:       '40px',
        'section-sm': '48px',
        section:    '64px',
        'section-lg': '96px',
        hero:       '120px',
      },
      boxShadow: {
        subtle:  'rgba(0,30,43,0.04) 0px 1px 2px 0px',
        card:    'rgba(0,30,43,0.08) 0px 4px 12px 0px',
        mockup:  'rgba(0,30,43,0.12) 0px 12px 24px -4px',
        modal:   'rgba(0,30,43,0.16) 0px 16px 48px -8px',
      },
      fontSize: {
        'hero':    ['72px', { lineHeight: '1.10', letterSpacing: '-1.5px', fontWeight: '500' }],
        'display': ['56px', { lineHeight: '1.15', letterSpacing: '-1px',   fontWeight: '500' }],
        'h1':      ['48px', { lineHeight: '1.20', letterSpacing: '-0.5px', fontWeight: '500' }],
        'h2':      ['36px', { lineHeight: '1.25', letterSpacing: '-0.5px', fontWeight: '500' }],
        'h3':      ['28px', { lineHeight: '1.30', fontWeight: '500' }],
        'h4':      ['22px', { lineHeight: '1.35', fontWeight: '500' }],
        'h5':      ['18px', { lineHeight: '1.40', fontWeight: '600' }],
      },
      animation: {
        'fade-in':     'fadeIn 150ms ease',
        'slide-up':    'slideUp 200ms ease',
        'slide-down':  'slideDown 200ms ease',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { from: { transform: 'translateY(-8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
