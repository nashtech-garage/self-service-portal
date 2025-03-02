import {
    createBaseThemeOptions,
    createUnifiedTheme,
    genPageTheme,
    palettes,
    shapes,
  } from '@backstage/theme';
  
  export const ntTheme = createUnifiedTheme({
    ...createBaseThemeOptions({
      palette: {
        ...palettes.light,
        primary: {
          main: '#343b58',
        },
        secondary: {
          main: '#565a6e',
        },
        error: {
          main: '#8c4351',
        },
        warning: {
          main: '#8f5e15',
        },
        info: {
          main: '#34548a',
        },
        success: {
          main: '#485e30',
        },
        background: {
          default: '#ffffff',
          paper: '#bdccc2',
        },
        banner: {
          info: '#34548a',
          error: '#8c4351',
          text: '#0078d4',
          link: '#565a6e',
        },
        errorBackground: '#8c4351',
        warningBackground: '#8f5e15',
        infoBackground: '#0078d4',
        navigation: {
          background: '#0078d4',
          indicator: '#8f5e15',
          color: '#ffffff',
          selectedColor: '#bdccc2',
          submenu: {
            background: '#0c6487',
           
            
          },
        },
      },
    }),
    defaultPageTheme: 'home',
    fontFamily: 'Helvetica Neue", Helvetica, Roboto, Arial, sans-serif',
    /* below drives the header colors */
    pageTheme: {
      home: genPageTheme({ colors: ['#932227', '#ce0217'], shape: shapes.wave }),
      documentation: genPageTheme({
        colors: ['#8c4351', '#0078d4'],
        shape: shapes.wave2,
      }),
      tool: genPageTheme({ colors: ['#8c4351', '#0078d4'], shape: shapes.round }),
      service: genPageTheme({
        colors: ['#8c4351', '#0078d4'],
        shape: shapes.wave,
      }),
      website: genPageTheme({
        colors: ['#8c4351', '#0078d4'],
        shape: shapes.wave,
      }),
      library: genPageTheme({
        colors: ['#8c4351', '#0078d4'],
        shape: shapes.wave,
      }),
      infrastructure: genPageTheme({
        colors: ['#8c4351', '#0078d4'],
        shape: shapes.wave,
      }),
      other: genPageTheme({ colors: ['#b10934', '#0078d4'], shape: shapes.wave }),
      app: genPageTheme({ colors: ['#b10934', '#0078d48'], shape: shapes.wave }),
      apis: genPageTheme({ colors: ['#b10934', '#0078d4'], shape: shapes.wave }),
    },
  });