import { alpha, createTheme, darken, lighten } from '@mui/material';
import createPalette from '@mui/material/styles/createPalette';

import { WHITE_COLOR, getBaseTheme } from './base';
import { lightThemePalatte } from './light';

const palette = createPalette({
  ...lightThemePalatte,
  background: {
    default: '#161B22',
    paper: '#161B22',
  },
  text: {
    disabled: alpha(darken(WHITE_COLOR, 0.15), 0.38),
    primary: alpha(darken(WHITE_COLOR, 0.15), 0.87),
    secondary: alpha(darken(WHITE_COLOR, 0.15), 0.6),
  },
  error: {
    main: lighten(lightThemePalatte.error.main, 0.5),
  },
  divider: alpha(WHITE_COLOR, 0.12),
  mode: 'dark',
});

const baseTheme = getBaseTheme(palette);

export const darkTheme = createTheme({
  ...baseTheme,
  palette: palette,
  components: {
    ...baseTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0D1117',
          color: palette.text.primary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.background.paper,
        },
      },
    },
  },
});
