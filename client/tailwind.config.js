/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        light: {
          // primary
          primary: '#4d44e3',
          'on-primary': '#ffffff',
          'primary-container': '#e2dfff',
          'on-primary-container': '#0f0069',

          // secondary
          secondary: '#b4136d',
          'on-secondary': '#ffffff',
          'secondary-container': '#ffd9e4',
          'on-secondary-container': '#3e0022',

          // tertiary
          tertiary: '#6d5e00',
          'on-tertiary': '#ffffff',
          'tertiary-container': '#fce265',
          'on-tertiary-container': '#211b00',

          // error
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#410002',

          // background
          background: '#EEEEEE',
          'on-background': '#1C1B1F',

          // surface
          surface: '#FFFBFE',
          'surface-variant': '#e4e1ec',
          'on-surface': '#1C1B1F',
          'on-surface-variant': '#474747',
          'surface-tint': '#4d44e3',

          // outline
          outline: '#D9D9D9',
          'outline-variant': '#c8c5d0',

          // inverse
          'inverse-surface': '#302175',
          'inverse-primary': '#c3c0ff',
          'inverse-on-surface': '#f4eeff',

          // misc
          shadow: '#000000',
          scrim: '#000000',
        },
        dark: {
          primary: '#c3c0ff',
          'on-primary': '#1d00a5',
          'primary-container': '#3323cc',
          'on-primary-container': '#e2dfff',

          // secondary
          secondary: '#ffb0cd',
          'on-secondary': '#640039',
          'secondary-container': '#8c0053',
          'on-secondary-container': '#ffd9e4',

          // tertiary
          tertiary: '#dfc64c',
          'tertiary-container': '#524600',
          'on-tertiary': '#393000',
          'on-tertiary-container': '#fce265',

          // error
          error: '#ffb4ab',
          'error-container': '#93000a',
          'on-error': '#690005',
          'on-error-container': '#ffdad6',

          // background
          background: '#1C1B1F',
          'on-background': '#E6E1E5',

          // surface
          surface: '#1C1B1F',
          'surface-variant': '#47464f',
          'on-surface': '#E6E1E5',
          'on-surface-variant': '#c8c5d0',
          'surface-tint': '#c3c0ff',

          // outline
          outline: '#928f9a',
          'outline-variant': '#47464f',

          // inverse
          'inverse-surface': '#e5deff',
          'inverse-primary': '#4d44e3',
          'inverse-on-surface': '#1b0261',

          // misc
          shadow: '#000000',
          scrim: '#000000',
        },
      },
      fontFamily: {
        sans: ['Ubuntu'],
        serif: ['Ubuntu'],
        mono: ['Ubuntu'],
      },
    },
  },
  plugins: [],
};
