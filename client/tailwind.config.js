/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          0: '#000000',
          10: '#0f0069',
          20: '#1d00a5',
          25: '#2606c2',
          30: '#3323cc',
          35: '#4034d7',
          40: '#4d44e3',
          50: '#6760fd',
          60: '#8582ff',
          70: '#a4a1ff',
          80: '#c3c0ff',
          90: '#e2dfff',
          95: '#f2efff',
          98: '#fcf8ff',
          99: '#fffbff',
          100: '#ffffff',
        },
        secondary: {
          0: '#000000',
          10: '#3e0022',
          20: '#640039',
          25: '#780046',
          30: '#8c0053',
          35: '#a20060',
          40: '#b4136d',
          50: '#d53587',
          60: '#f751a1',
          70: '#ff82b8',
          80: '#ffb0cd',
          90: '#ffd9e4',
          95: '#ffecf1',
          98: '#fff8f8',
          99: '#fffbff',
          100: '#ffffff',
        },
        tertiary: {
          0: '#000000',
          10: '#211b00',
          20: '#393000',
          25: '#453b00',
          30: '#524600',
          35: '#605200',
          40: '#6d5e00',
          50: '#897700',
          60: '#a59016',
          70: '#c2ab33',
          80: '#dfc64c',
          90: '#fce265',
          95: '#fff1b9',
          98: '#fff9ed',
          99: '#fffbff',
          100: '#ffffff',
        },
        neutral: {
          0: '#000000',
          10: '#1b0261',
          20: '#302175',
          25: '#3b2d81',
          30: '#47398d',
          35: '#53469a',
          40: '#5f52a7',
          50: '#786bc2',
          60: '#9285dd',
          70: '#ad9ffa',
          80: '#c9bfff',
          90: '#e5deff',
          95: '#f4eeff',
          98: '#fdf8ff',
          99: '#fffbff',
          100: '#ffffff',
        },
        'neutral-variant': {
          0: '#000000',
          10: '#1b1b23',
          20: '#302f38',
          25: '#3b3a43',
          30: '#47464f',
          35: '#53515a',
          40: '#5f5d67',
          50: '#787680',
          60: '#928f9a',
          70: '#acaab4',
          80: '#c8c5d0',
          90: '#e4e1ec',
          95: '#f3effa',
          98: '#fcf8ff',
          99: '#fffbff',
          100: '#ffffff',
        },
        error: {
          0: '#000000',
          10: '#410002',
          20: '#690005',
          25: '#7e0007',
          30: '#93000a',
          35: '#a80710',
          40: '#ba1a1a',
          50: '#de3730',
          60: '#ff5449',
          70: '#ff897d',
          80: '#ffb4ab',
          90: '#ffdad6',
          95: '#ffedea',
          98: '#fff8f7',
          99: '#fffbff',
          100: '#ffffff',
        },
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
          background: '#fffbff',
          'on-background': '#1b0261',

          // surface
          surface: '#fffbff',
          'surface-variant': '#e4e1ec',
          'on-surface': '#1b0261',
          'on-surface-variant': '#47464f',
          'surface-tint': '#4d44e3',

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
          background: '#1b0261',
          'on-background': '#e5deff',

          // surface
          surface: '#1b0261',
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
      // fontFamily: {
      //   sans: ['Ubuntu'],
      //   serif: ['Ubuntu'],
      //   mono: ['Ubuntu'],
      // },
    },
  },
  plugins: [],
};
