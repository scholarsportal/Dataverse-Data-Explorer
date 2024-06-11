/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-mode="dark"]'],
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        light: {
          // primary
          primary: '#4338ca',
          'on-primary': '#ffffff',
          'primary-container': '#e2dfff',
          'on-primary-container': '#0f0069',

          // secondary
          secondary: '#EC4899',
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
          background: '#fffbff',
          'on-background': '#1b0261',

          // surface
          surface: '#e0dbdf',
          'surface-variant': '#f3f4f6',
          'on-surface': '#1C1B1F',
          'on-surface-variant': '#E7E0EC',
          'surface-tint': '#D0BCFF',

          // outline
          outline: '#787680',
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
          'on-background': '#e5deff',

          // surface
          surface: '#0d0c0f',
          'surface-variant': '#323236',
          'on-surface': '#E6E1E5',
          'on-surface-variant': '#CAC4D0',
          'surface-tint': '#D0BCFF',

          // outline
          outline: '#928f9a',
          'outline-variant': '#47464f',

          // inverse
          'inverse-surface': '#E6E1E5',
          'inverse-primary': '#6750A4',
          'inverse-on-surface': '#313033',

          // misc
          shadow: '#000000',
          scrim: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        //   serif: ['Ubuntu'],
        //   mono: ['Ubuntu'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#4338CA',
          secondary: '#DB2777',
          accent: '#ffffff',
          neutral: '#F3F4F6',
          'base-100': '#ffffff',
          error: '#d00000',
          success: '#108400',
        },
      },
      {
        dark: {
          primary: '#DBCCFF',
          secondary: '#FFC7E0',
          accent: '#ffffff',
          neutral: '#323236',
          'base-100': '#3F3F46',
          error: '#ffa5a5',
          success: '#6effc9',
        },
      },
    ],
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
};
